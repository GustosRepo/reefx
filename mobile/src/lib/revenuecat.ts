/**
 * RevenueCat Configuration
 * 
 * Setup Steps:
 * 1. Create account at https://app.revenuecat.com
 * 2. Create a new project
 * 3. Add your iOS app (use Bundle ID: com.aquaxone.app)
 * 4. Create "Entitlements" (e.g., "premium", "super_premium")
 * 5. Create "Products" in App Store Connect first, then add them in RevenueCat
 * 6. Copy your API key below
 */

import { Platform } from 'react-native';

// Try to import RevenueCat - it may not be installed in development builds
let Purchases: any = null;
let LOG_LEVEL: any = { DEBUG: 0 };

try {
  const revenueCat = require('react-native-purchases');
  Purchases = revenueCat.default;
  LOG_LEVEL = revenueCat.LOG_LEVEL;
} catch (e) {
  console.log('RevenueCat not available - using mock implementation');
}

// Type definitions for when RevenueCat isn't available
export type PurchasesPackage = {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    priceString: string;
    price: number;
    title: string;
    description: string;
  };
  offeringIdentifier: string;
};

export type CustomerInfo = {
  entitlements: {
    active: Record<string, { 
      identifier: string; 
      isActive: boolean;
      expirationDate?: string;
      willRenew?: boolean;
    }>;
  };
  activeSubscriptions: string[];
  originalAppUserId: string;
};

export type PurchasesOffering = {
  identifier: string;
  availablePackages: PurchasesPackage[];
  monthly?: PurchasesPackage;
  annual?: PurchasesPackage;
};

// RevenueCat API Keys - Get these from your RevenueCat dashboard
// App Settings > API Keys
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'your_ios_api_key_here';
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'your_android_api_key_here';

// Entitlement IDs - These must match what you create in RevenueCat dashboard
export const ENTITLEMENTS = {
  PREMIUM: 'premium',
  SUPER_PREMIUM: 'super_premium',
} as const;

// Product IDs - These must match App Store Connect product IDs
export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'com.aquaxone.premium.monthly',
  PREMIUM_YEARLY: 'com.aquaxone.premium.yearly',
  SUPER_PREMIUM_MONTHLY: 'com.aquaxone.superpremium.monthly',
  SUPER_PREMIUM_YEARLY: 'com.aquaxone.superpremium.yearly',
} as const;

/**
 * Initialize RevenueCat SDK
 * Call this once when app starts (in _layout.tsx or App.tsx)
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (!Purchases) {
    console.log('RevenueCat not available - skipping initialization');
    return;
  }
  
  try {
    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure with platform-specific API key
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
    
    await Purchases.configure({ 
      apiKey,
      appUserID: userId, // Link to your Supabase user ID for cross-platform sync
    });

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
}

/**
 * Login user to RevenueCat (call after Supabase auth)
 * This links their purchases to your user ID
 */
export async function loginRevenueCat(userId: string): Promise<CustomerInfo | null> {
  if (!Purchases) return null;
  
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.error('RevenueCat login failed:', error);
    return null;
  }
}

/**
 * Logout from RevenueCat (call on sign out)
 */
export async function logoutRevenueCat(): Promise<void> {
  if (!Purchases) return;
  
  try {
    await Purchases.logOut();
  } catch (error) {
    console.error('RevenueCat logout failed:', error);
  }
}

/**
 * Get current customer info (subscription status)
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!Purchases) return null;
  
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    return null;
  }
}

/**
 * Get available offerings (products/packages)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!Purchases) return null;
  
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (!Purchases) {
    return { success: false, error: 'RevenueCat not available' };
  }
  
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error: any) {
    // User cancelled
    if (error.userCancelled) {
      return { success: false, error: 'cancelled' };
    }
    console.error('Purchase failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  if (!Purchases) {
    return { success: false, error: 'RevenueCat not available' };
  }
  
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (error: any) {
    console.error('Restore failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user has a specific entitlement
 */
export function hasEntitlement(
  customerInfo: CustomerInfo | null, 
  entitlement: string
): boolean {
  if (!customerInfo) return false;
  return customerInfo.entitlements.active[entitlement]?.isActive ?? false;
}

/**
 * Get subscription tier from customer info
 */
export function getTierFromCustomerInfo(customerInfo: CustomerInfo | null): 'free' | 'premium' | 'super-premium' {
  if (!customerInfo) return 'free';
  
  if (hasEntitlement(customerInfo, ENTITLEMENTS.SUPER_PREMIUM)) {
    return 'super-premium';
  }
  if (hasEntitlement(customerInfo, ENTITLEMENTS.PREMIUM)) {
    return 'premium';
  }
  return 'free';
}

// Store listeners for when Purchases isn't available
const mockListeners: Set<(info: CustomerInfo) => void> = new Set();

/**
 * Add a listener for customer info updates
 */
export function addCustomerInfoUpdateListener(listener: (info: CustomerInfo) => void): void {
  if (Purchases) {
    Purchases.addCustomerInfoUpdateListener(listener);
  } else {
    mockListeners.add(listener);
  }
}

/**
 * Remove a listener for customer info updates
 */
export function removeCustomerInfoUpdateListener(listener: (info: CustomerInfo) => void): void {
  if (Purchases) {
    Purchases.removeCustomerInfoUpdateListener(listener);
  } else {
    mockListeners.delete(listener);
  }
}
