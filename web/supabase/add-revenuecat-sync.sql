-- Add RevenueCat columns to subscriptions table
-- Run this in your Supabase SQL Editor

-- Add columns for RevenueCat sync
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS revenuecat_product_id TEXT,
ADD COLUMN IF NOT EXISTS revenuecat_store TEXT,
ADD COLUMN IF NOT EXISTS revenuecat_environment TEXT,
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_platform ON public.subscriptions(platform);

-- Comment for documentation
COMMENT ON COLUMN public.subscriptions.platform IS 'web, ios, or android - where subscription was purchased';
COMMENT ON COLUMN public.subscriptions.revenuecat_store IS 'APP_STORE, PLAY_STORE, STRIPE, or PROMOTIONAL';
