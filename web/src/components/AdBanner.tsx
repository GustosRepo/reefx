"use client";

import { useEffect, useState } from "react";
import { hasPremium } from "@/utils/subscription";

export default function AdBanner() {
  const [isPremium, setIsPremium] = useState(true);

  useEffect(() => {
    setIsPremium(hasPremium());
  }, []);

  // Don't show ads for premium users
  if (isPremium) {
    return null;
  }

  return (
    <div className="my-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
        
        <div className="relative z-10">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Advertisement</p>
          
          {/* Simulated Ad Content */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-8 my-4">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">🎯</div>
              <p className="text-lg font-semibold text-white">Your Ad Could Be Here</p>
              <p className="text-sm text-gray-400 max-w-md">
                This space is reserved for advertisements in the free version.
              </p>
            </div>
          </div>

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
