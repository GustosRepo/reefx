import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { Subscription } from '@shared/types';
import { TIER_FEATURES } from '@/constants';
import {
  initializeRevenueCat,
  loginRevenueCat,
  logoutRevenueCat,
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getTierFromCustomerInfo,
  addCustomerInfoUpdateListener,
  removeCustomerInfoUpdateListener,
  CustomerInfo,
  PurchasesPackage,
  PurchasesOffering,
} from '@/lib/revenuecat';

// Create a union type of all tier features
type TierFeatures = typeof TIER_FEATURES[keyof typeof TIER_FEATURES];

interface SubscriptionContextValue {
  subscription: Subscription;
  isLoading: boolean;
  features: TierFeatures;
  refreshSubscription: () => Promise<void>;
  hasFeature: (feature: keyof TierFeatures) => boolean;
  // RevenueCat specific
  offerings: PurchasesOffering | null;
  isLoadingOfferings: boolean;
  purchase: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  restore: () => Promise<{ success: boolean; error?: string }>;
  customerInfo: CustomerInfo | null;
  activeProductId: string | null;
}

const defaultSubscription: Subscription = {
  tier: 'free',
  status: 'active',
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription>(defaultSubscription);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const { user, isGuestMode } = useAuth();

  // In guest mode, unlock everything so they experience the full app
  const features = isGuestMode
    ? TIER_FEATURES['super-premium']
    : (TIER_FEATURES[subscription.tier] || TIER_FEATURES.free);

  const effectiveSubscription = isGuestMode
    ? { ...subscription, tier: 'super-premium' as const }
    : subscription;

  // Initialize RevenueCat on mount
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  // Link RevenueCat to user on login/logout
  useEffect(() => {
    if (user) {
      loginRevenueCat(user.id).then(info => {
        if (info) {
          setCustomerInfo(info);
          updateSubscriptionFromCustomerInfo(info);
        }
      });
    } else {
      logoutRevenueCat();
      setCustomerInfo(null);
      setSubscription(defaultSubscription);
    }
  }, [user]);

  // Load offerings
  useEffect(() => {
    const loadOfferings = async () => {
      setIsLoadingOfferings(true);
      const currentOffering = await getOfferings();
      setOfferings(currentOffering);
      setIsLoadingOfferings(false);
    };
    loadOfferings();
  }, []);

  // Listen for customer info updates
  useEffect(() => {
    const listener = (info: CustomerInfo) => {
      setCustomerInfo(info);
      updateSubscriptionFromCustomerInfo(info);
    };

    addCustomerInfoUpdateListener(listener);
    
    return () => {
      removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  // Update local subscription state from RevenueCat customer info
  const updateSubscriptionFromCustomerInfo = useCallback((info: CustomerInfo) => {
    const tier = getTierFromCustomerInfo(info);
    
    // Find the active entitlement to get expiration info and product ID
    const activeEntitlements = Object.values(info.entitlements.active);
    const mainEntitlement = activeEntitlements[0];
    
    // Get the active product identifier from activeSubscriptions
    const productId = info.activeSubscriptions?.[0] || null;
    setActiveProductId(productId);

    setSubscription({
      tier,
      status: activeEntitlements.length > 0 ? 'active' : 'active',
      current_period_end: mainEntitlement?.expirationDate ?? undefined,
      cancel_at_period_end: mainEntitlement?.willRenew === false,
    });
  }, []);

  // Refresh subscription from both RevenueCat and Supabase
  const refreshSubscription = useCallback(async () => {
    setIsLoading(true);

    try {
      // Try RevenueCat first (for IAP purchases)
      const info = await getCustomerInfo();
      if (info) {
        setCustomerInfo(info);
        const rcTier = getTierFromCustomerInfo(info);
        
        // If user has active IAP subscription, use that
        if (rcTier !== 'free') {
          updateSubscriptionFromCustomerInfo(info);
          setIsLoading(false);
          return;
        }
      }

      // Fall back to Supabase (for web Stripe subscriptions)
      if (user) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setSubscription({
            tier: data.tier || 'free',
            status: data.status || 'active',
            current_period_end: data.current_period_end,
            cancel_at_period_end: data.cancel_at_period_end,
          });
          setIsLoading(false);
          return;
        }
      }

      // Default to free
      setSubscription(defaultSubscription);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setSubscription(defaultSubscription);
    } finally {
      setIsLoading(false);
    }
  }, [user, updateSubscriptionFromCustomerInfo]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Purchase a package
  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<{ success: boolean; error?: string }> => {
    const result = await purchasePackage(pkg);
    
    if (result.success && result.customerInfo) {
      setCustomerInfo(result.customerInfo);
      updateSubscriptionFromCustomerInfo(result.customerInfo);
    }
    
    return { success: result.success, error: result.error };
  }, [updateSubscriptionFromCustomerInfo]);

  // Restore purchases
  const restore = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const result = await restorePurchases();
    
    if (result.success && result.customerInfo) {
      setCustomerInfo(result.customerInfo);
      updateSubscriptionFromCustomerInfo(result.customerInfo);
    }
    
    return { success: result.success, error: result.error };
  }, [updateSubscriptionFromCustomerInfo]);

  const hasFeature = useCallback((feature: keyof TierFeatures): boolean => {
    return !!features[feature];
  }, [features]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription: effectiveSubscription,
        isLoading,
        features,
        refreshSubscription,
        hasFeature,
        offerings,
        isLoadingOfferings,
        purchase,
        restore,
        customerInfo,
        activeProductId,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
