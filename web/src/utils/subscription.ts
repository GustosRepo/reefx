// Subscription feature enforcement utilities

export type SubscriptionTier = 'free' | 'premium' | 'super-premium';

export interface Subscription {
  tier: SubscriptionTier;
  status: string;
  end_date: string | null;
}

// Feature availability by tier
const FEATURE_ACCESS: Record<string, SubscriptionTier[]> = {
  // Free tier - everyone has access
  BASIC_LOGGING: ['free', 'premium', 'super-premium'],
  DASHBOARD: ['free', 'premium', 'super-premium'],
  MAINTENANCE: ['free', 'premium', 'super-premium'],
  HISTORY: ['free', 'premium', 'super-premium'],
  SETTINGS: ['free', 'premium', 'super-premium'],
  
  // Premium tier and above
  EQUIPMENT_TRACKING: ['premium', 'super-premium'],
  SMS_ALERTS: ['premium', 'super-premium'],
  
  // Super Premium only
  LIVESTOCK_INVENTORY: ['super-premium'],
  PHOTO_GALLERY: ['super-premium'],
  MULTI_TANK: ['super-premium'],
};

export type Feature = keyof typeof FEATURE_ACCESS;

/**
 * Check if user's subscription tier has access to a feature
 */
export function hasFeatureAccess(userTier: SubscriptionTier, feature: Feature): boolean {
  return FEATURE_ACCESS[feature].includes(userTier);
}

/**
 * Get user's subscription from API
 */
export async function getUserSubscription(): Promise<Subscription> {
  try {
    const response = await fetch('/api/subscription');
    if (!response.ok) {
      return { tier: 'free', status: 'active', end_date: null };
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return { tier: 'free', status: 'active', end_date: null };
  }
}

/**
 * Get the minimum tier required for a feature
 */
export function getRequiredTier(feature: Feature): SubscriptionTier {
  const tiers = FEATURE_ACCESS[feature];
  if (tiers.includes('free')) return 'free';
  if (tiers.includes('premium')) return 'premium';
  return 'super-premium';
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free': return 'Free';
    case 'premium': return 'Premium';
    case 'super-premium': return 'Super Premium';
  }
}

/**
 * Get tier price
 */
export function getTierPrice(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free': return '$0';
    case 'premium': return '$4.99/mo';
    case 'super-premium': return '$9.99/mo';
  }
}

/**
 * Check if user needs to upgrade for a feature
 */
export function needsUpgrade(userTier: SubscriptionTier, feature: Feature): boolean {
  return !hasFeatureAccess(userTier, feature);
}
