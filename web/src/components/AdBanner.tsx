"use client";

import { useSubscription } from "@/context/SubscriptionContext";
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdBanner() {
  const { subscription } = useSubscription();
  const isPremium = subscription.tier !== 'free';

  useEffect(() => {
    if (!isPremium) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [isPremium]);

  // Don't show ads for premium users
  if (isPremium) {
    return null;
  }

  return (
    <div className="my-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
        
        <div className="relative z-10">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Advertisement</p>
          
          {/* Google AdSense */}
          <ins 
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-8863066373093222"
            data-ad-slot="7980071528"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />

          {/* Upgrade CTA */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-3">
              Remove ads and support development
            </p>
            <a
              href="/subscription"
              className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
            >
              Upgrade to Premium
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
