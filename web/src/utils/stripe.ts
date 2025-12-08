import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

// Stripe Price IDs - Update these after creating products in Stripe Dashboard
export const STRIPE_PRICES = {
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID || '', // $4.99/month
  SUPER_PREMIUM: process.env.STRIPE_SUPER_PREMIUM_PRICE_ID || '', // $9.99/month
};

// Tier names matching database schema
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  SUPER_PREMIUM: 'super-premium',
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];
