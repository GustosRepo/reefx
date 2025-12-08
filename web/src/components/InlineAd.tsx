"use client";

import { useSubscription } from "@/context/SubscriptionContext";
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function InlineAd() {
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

  if (isPremium) {
    return null;
  }

  return (
    <div className="my-4">
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8863066373093222"
        data-ad-slot="7980071528"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
