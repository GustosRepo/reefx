"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import type { SubscriptionTier, Subscription } from '@/utils/subscription';

interface SubscriptionContextType {
  subscription: Subscription;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEY = 'reefx_subscription';

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage immediately - no flicker!
  const [subscription, setSubscription] = useState<Subscription>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error('Failed to parse cached subscription:', e);
        }
      }
    }
    return {
      tier: 'free',
      status: 'active',
      end_date: null,
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        // Update state and cache
        setSubscription(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch in background to sync with API
    fetchSubscription();

    // Refresh subscription when user returns to tab (e.g., after Stripe checkout)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSubscription();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchSubscription]);

  const refreshSubscription = useCallback(async () => {
    setIsLoading(true);
    await fetchSubscription();
  }, [fetchSubscription]);

  // Clear cache on logout
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue === null) {
        setSubscription({
          tier: 'free',
          status: 'active',
          end_date: null,
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const contextValue = useMemo(
    () => ({ subscription, isLoading, refreshSubscription }),
    [subscription, isLoading, refreshSubscription]
  );

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
