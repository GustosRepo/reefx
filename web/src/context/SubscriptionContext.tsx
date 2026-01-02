"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import type { SubscriptionTier, Subscription } from '@/utils/subscription';

interface SubscriptionContextType {
  subscription: Subscription;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEY = 'reefxone_subscription';

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
      // Silently ignore 401 (not logged in) - this is expected on landing page
      if (response.status === 401) {
        setIsLoading(false);
        return;
      }
      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          console.warn('Expected JSON response from /api/subscription but got:', contentType);
        } else {
          const data = await response.json();
          // Update state and cache
          setSubscription(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
      }
    } catch (error) {
      // Only log non-network errors
      if (error instanceof Error && !error.message.includes('fetch')) {
        console.error('Error fetching subscription:', error);
      }
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
