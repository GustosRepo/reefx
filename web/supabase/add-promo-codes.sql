-- Promo Codes System for Partner/Influencer Marketing
-- Run this in Supabase SQL Editor

-- ============================================================================
-- PROMO CODES TABLE
-- ============================================================================
CREATE TABLE public.promo_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g., "REEFTANK2025", "BULKREEFSUPPLY"
  partner_name TEXT NOT NULL, -- e.g., "Bulk Reef Supply", "ReefBuilders YouTube"
  partner_email TEXT, -- Contact email for the partner
  
  -- What the code gives
  discount_type TEXT NOT NULL CHECK (discount_type IN ('free_trial', 'percent_off', 'amount_off')),
  discount_value INT NOT NULL, -- 1 = 1 month free, 30 = 30% off, 500 = $5 off (in cents)
  applies_to TEXT NOT NULL DEFAULT 'premium' CHECK (applies_to IN ('premium', 'super-premium', 'both')),
  
  -- Limits
  max_uses INT, -- NULL for unlimited
  uses_count INT DEFAULT 0 NOT NULL,
  max_uses_per_user INT DEFAULT 1 NOT NULL,
  
  -- Validity
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Stripe coupon ID (if using Stripe coupons)
  stripe_coupon_id TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index for fast code lookups
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_active ON public.promo_codes(is_active, expires_at);

-- ============================================================================
-- PROMO CODE REDEMPTIONS (Track who used what code)
-- ============================================================================
CREATE TABLE public.promo_code_redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE CASCADE NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  subscription_id TEXT, -- Stripe subscription ID if applicable
  
  UNIQUE(user_id, promo_code_id) -- Each user can only redeem a code once
);

-- Index for lookups
CREATE INDEX idx_redemptions_user ON public.promo_code_redemptions(user_id);
CREATE INDEX idx_redemptions_code ON public.promo_code_redemptions(promo_code_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Promo codes: Anyone can read active codes (for validation), only admins can modify
-- For now, we'll use service role for admin operations
CREATE POLICY "Anyone can read active promo codes" ON public.promo_codes
  FOR SELECT USING (is_active = true);

-- Redemptions: Users can only see their own redemptions
CREATE POLICY "Users can view own redemptions" ON public.promo_code_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own redemptions" ON public.promo_code_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE PROMO CODES (for testing)
-- ============================================================================
-- Uncomment to add test codes:

-- INSERT INTO public.promo_codes (code, partner_name, discount_type, discount_value, applies_to, notes) VALUES
-- ('REEFTANK2025', 'Test Partner', 'free_trial', 30, 'premium', '30 days free Premium'),
-- ('BRS20', 'Bulk Reef Supply', 'percent_off', 20, 'both', '20% off first month'),
-- ('YOUTUBE1MONTH', 'YouTube Promo', 'free_trial', 30, 'premium', '1 month free Premium');
