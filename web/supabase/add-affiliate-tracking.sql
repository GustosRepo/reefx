-- Affiliate Tracking System for Partner Revenue Share
-- Run this in Supabase SQL Editor

-- ============================================================================
-- ADD REFERRAL TRACKING TO SUBSCRIPTIONS
-- ============================================================================
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS referred_by_promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_referred_by ON public.subscriptions(referred_by_promo_code_id);

-- ============================================================================
-- AFFILIATE EARNINGS TABLE
-- Tracks each payment that generates affiliate commission
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The paying customer
  
  -- Payment details
  stripe_payment_intent_id TEXT, -- Stripe payment ID for reference
  stripe_invoice_id TEXT, -- Stripe invoice ID
  payment_amount_cents INT NOT NULL, -- Total payment in cents (e.g., 499 for $4.99)
  commission_rate DECIMAL(5, 4) DEFAULT 0.05 NOT NULL, -- 5% = 0.05
  commission_amount_cents INT NOT NULL, -- Amount owed to partner in cents
  
  -- Subscription details
  subscription_tier TEXT NOT NULL, -- 'premium' or 'super-premium'
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  -- Prevent duplicate entries for same payment
  UNIQUE(stripe_invoice_id)
);

-- Indexes for reporting
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_promo ON public.affiliate_earnings(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_status ON public.affiliate_earnings(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_created ON public.affiliate_earnings(created_at);

-- ============================================================================
-- AFFILIATE PAYOUTS TABLE
-- Tracks when you pay out partners
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE CASCADE NOT NULL,
  
  -- Payout details
  amount_cents INT NOT NULL, -- Total payout amount in cents
  payment_method TEXT, -- 'paypal', 'venmo', 'check', etc.
  payment_reference TEXT, -- PayPal transaction ID, check number, etc.
  notes TEXT,
  
  -- Period covered
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_promo ON public.affiliate_payouts(promo_code_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Only service role can access these tables (admin only)
-- No public policies - all access through service role in API

-- ============================================================================
-- HELPER VIEW: Partner Earnings Summary
-- ============================================================================
CREATE OR REPLACE VIEW public.partner_earnings_summary AS
SELECT 
  pc.id as promo_code_id,
  pc.code,
  pc.partner_name,
  pc.partner_email,
  pc.uses_count as total_redemptions,
  COUNT(DISTINCT ae.user_id) as paying_customers,
  COALESCE(SUM(ae.payment_amount_cents), 0) as total_revenue_cents,
  COALESCE(SUM(ae.commission_amount_cents), 0) as total_commission_cents,
  COALESCE(SUM(CASE WHEN ae.status = 'pending' THEN ae.commission_amount_cents ELSE 0 END), 0) as pending_commission_cents,
  COALESCE(SUM(CASE WHEN ae.status = 'paid' THEN ae.commission_amount_cents ELSE 0 END), 0) as paid_commission_cents
FROM public.promo_codes pc
LEFT JOIN public.affiliate_earnings ae ON pc.id = ae.promo_code_id
GROUP BY pc.id, pc.code, pc.partner_name, pc.partner_email, pc.uses_count;

-- Grant access to the view for authenticated users (will be filtered by service role anyway)
-- The API will use service role to query this
