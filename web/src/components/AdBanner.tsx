"use client";

import { useSubscription } from "@/context/SubscriptionContext";

// Ads are temporarily disabled until AdSense approval
// Set to true once approved to show ads to free users
const ADS_ENABLED = false;

export default function AdBanner() {
  const { subscription } = useSubscription();
  const isPremium = subscription.tier !== 'free';

  // Hide ads completely until approved
  if (!ADS_ENABLED || isPremium) {
    return null;
  }

  // This will render once ADS_ENABLED is set to true
  return (
    <div className="my-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-lg p-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
        
        <div className="relative z-10">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Advertisement</p>
          
          {/* Google AdSense - uncomment when approved */}
          {/* <ins 
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-XXXXXXX"
            data-ad-slot="XXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
          /> */}

          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-3">
              Remove ads and support development
            </p>
            <a
              href="/subscription"
              className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105"
            >
              Upgrade to Premium
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
