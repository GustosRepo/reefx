// Subscription feature enforcement utilities

export type SubscriptionTier = 'free' | 'premium' | 'super-premium';

export interface Subscription {
  tier: SubscriptionTier;
  status: string;
  end_date: string | null;
  storage_used_mb?: number;
}

// Storage limits per tier (in MB)
export const STORAGE_LIMITS: Record<SubscriptionTier, number> = {
  'free': 0,
  'premium': 500,        // 500MB
  'super-premium': 5120, // 5GB
};

// Tank limits per tier
export const TANK_LIMITS: Record<SubscriptionTier, number> = {
  'free': 1,
  'premium': 3,
  'super-premium': 5,
};

/**
 * Get tank limit for a tier
 */
export function getTankLimit(tier: SubscriptionTier): number {
  return TANK_LIMITS[tier];
}

// Feature availability by tier
const FEATURE_ACCESS: Record<string, SubscriptionTier[]> = {
  // Free tier - everyone has access
  BASIC_LOGGING: ['free', 'premium', 'super-premium'],
  DASHBOARD: ['free', 'premium', 'super-premium'],
  MAINTENANCE: ['free', 'premium', 'super-premium'],
  HISTORY: ['free', 'premium', 'super-premium'],
  SETTINGS: ['free', 'premium', 'super-premium'],
  DATA_EXPORT: ['free', 'premium', 'super-premium'], // Basic export for all
  
  // Premium tier and above - Ad-free + extras
  AD_FREE: ['premium', 'super-premium'],
  UNLIMITED_HISTORY: ['premium', 'super-premium'],
  PHOTO_STORAGE: ['premium', 'super-premium'], // 500MB for premium, 5GB for super
  
  // Super Premium only
  EQUIPMENT_TRACKING: ['super-premium'],
  LIVESTOCK_INVENTORY: ['super-premium'],
  MULTI_TANK: ['super-premium'],
  SMS_ALERTS: ['super-premium'],
  COMMUNITY_PROFILES: ['super-premium'],
};

export type Feature = keyof typeof FEATURE_ACCESS;

/**
 * Check if user's subscription tier has access to a feature
 */
export function hasFeatureAccess(userTier: SubscriptionTier, feature: Feature): boolean {
  const access = FEATURE_ACCESS[feature];
  if (!access) return false;
  return access.includes(userTier);
}

/**
 * Legacy compatibility - check if tier has a feature by string name
 */
export function hasFeature(tier: SubscriptionTier, feature: string): boolean {
  const featureKey = feature.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '');
  return hasFeatureAccess(tier, featureKey as Feature);
}

/**
 * Check if tier is premium or higher
 */
export function isPremiumOrHigher(tier: SubscriptionTier): boolean {
  return tier === 'premium' || tier === 'super-premium';
}

/**
 * Check if tier is super premium
 */
export function isSuperPremium(tier: SubscriptionTier): boolean {
  return tier === 'super-premium';
}

/**
 * Get storage limit for a tier (in MB)
 */
export function getStorageLimit(tier: SubscriptionTier): number {
  return STORAGE_LIMITS[tier];
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
  if (!tiers) return 'super-premium';
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

/**
 * Get all features available for a tier
 */
export function getTierFeatures(tier: SubscriptionTier): string[] {
  return Object.entries(FEATURE_ACCESS)
    .filter(([, tiers]) => tiers.includes(tier))
    .map(([feature]) => feature);
}

// === Local Storage-based Storage Tracking (for demo/dev) ===
const STORAGE_KEY = 'reefx_storage_used';

/**
 * Get current storage used (in MB) - localStorage-based for demo
 */
export function getStorageUsed(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseFloat(stored) : 0;
}

/**
 * Update storage used (in MB) - localStorage-based for demo
 */
export function updateStorageUsed(newAmount: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, newAmount.toString());
}

/**
 * Check if user has super premium tier - legacy helper
 */
export function hasSuperPremium(tier: SubscriptionTier): boolean {
  return tier === 'super-premium';
}
