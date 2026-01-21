"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useSubscription } from "@/context/SubscriptionContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

type SubscriptionTier = 'free' | 'premium' | 'super-premium';

interface UserSubscription {
  tier: SubscriptionTier;
  status: string;
  end_date: string | null;
}

export default function SubscriptionPage() {
  return (
    <ProtectedRoute>
      <SubscriptionPageContent />
    </ProtectedRoute>
  );
}

function SubscriptionPageContent() {
  const { subscription: contextSubscription, refreshSubscription } = useSubscription();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(5);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeValid, setPromoCodeValid] = useState<boolean | null>(null);
  const [promoCodeInfo, setPromoCodeInfo] = useState<{ discountDescription: string; partner: string } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [redeemingPromo, setRedeemingPromo] = useState(false);

  const currentTier = contextSubscription.tier;

  useEffect(() => {
    loadSubscription();
    
    // Check for donation success/cancel from URL params
    const donation = searchParams.get('donation');
    const donate = searchParams.get('donate');
    
    if (donation === 'success') {
      toast.success('Thank you for your support! ☕💙');
      // Clean up URL
      window.history.replaceState({}, '', '/subscription');
    } else if (donation === 'cancelled') {
      toast('Donation cancelled', { icon: '👋' });
      window.history.replaceState({}, '', '/subscription');
    }
    
    // Open donate modal if coming from landing page
    if (donate === 'true') {
      setShowDonateModal(true);
      window.history.replaceState({}, '', '/subscription');
    }
  }, [searchParams]);

  const handleDonate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: donationAmount }),
      });

      if (!response.ok) throw new Error('Failed to create donation checkout');

      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Donation error:', err);
      toast.error('Failed to start donation checkout');
    } finally {
      setLoading(false);
    }
  };

  // Validate promo code
  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeValid(null);
      setPromoCodeInfo(null);
      return;
    }

    setValidatingPromo(true);
    try {
      const response = await fetch(`/api/promo-code?code=${encodeURIComponent(promoCode)}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setPromoCodeValid(true);
        setPromoCodeInfo({
          discountDescription: data.discountDescription,
          partner: data.partner,
        });
        toast.success(`Promo code applied: ${data.discountDescription}!`);
      } else {
        setPromoCodeValid(false);
        setPromoCodeInfo(null);
        toast.error(data.error || 'Invalid promo code');
      }
    } catch (err) {
      setPromoCodeValid(false);
      setPromoCodeInfo(null);
      toast.error('Failed to validate promo code');
    } finally {
      setValidatingPromo(false);
    }
  };

  // Redeem promo code for card-free trial
  const redeemPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setRedeemingPromo(true);
    try {
      const response = await fetch('/api/promo-code/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccessMessage(data.message);
        setShowSuccess(true);
        toast.success(data.message);
        // Reset promo code state
        setPromoCode('');
        setPromoCodeValid(null);
        setPromoCodeInfo(null);
        // Refresh subscription to reflect new tier
        await loadSubscription();
      } else {
        toast.error(data.error || 'Failed to redeem promo code');
      }
    } catch (err) {
      console.error('Error redeeming promo code:', err);
      toast.error('Failed to redeem promo code');
    } finally {
      setRedeemingPromo(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
        await refreshSubscription(); // Refresh the context
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

  const handleSubscribe = async (priceId: string, tier: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriceId = (tier: 'premium' | 'super-premium'): string => {
    // These will be set after creating products in Stripe Dashboard
    if (tier === 'premium') {
      return process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium_placeholder';
    }
    return process.env.NEXT_PUBLIC_STRIPE_SUPER_PREMIUM_PRICE_ID || 'price_super_premium_placeholder';
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Show appropriate message based on whether it was already canceled
      toast.success(data.message);
      await loadSubscription();
    } catch (err: any) {
      console.error('Cancel error:', err);
      toast.error(err.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Dev tool: Manual tier update
  const manualUpdateTier = async (tier: string) => {
    try {
      const response = await fetch('/api/subscription/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      if (response.ok) {
        setSuccessMessage(`Successfully updated to ${tier}!`);
        setShowSuccess(true);
        await loadSubscription();
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleUpgradePremium = async (months: number) => {
    setLoading(true);
    try {
      const priceId = months === 12 
        ? process.env.NEXT_PUBLIC_STRIPE_PREMIUM_ANNUAL_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID;
      if (!priceId) {
        toast.error('Stripe Price ID not configured. Please contact support.');
        return;
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier: 'premium', promoCode: promoCodeValid ? promoCode : undefined }),
      });

      if (!response.ok) throw new Error('Failed to create checkout');

      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Upgrade error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSuperPremium = async (months: number) => {
    setLoading(true);
    try {
      const priceId = months === 12
        ? process.env.NEXT_PUBLIC_STRIPE_SUPER_PREMIUM_ANNUAL_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_SUPER_PREMIUM_PRICE_ID;
      if (!priceId) {
        toast.error('Stripe Price ID not configured. Please contact support.');
        return;
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier: 'super-premium', promoCode: promoCodeValid ? promoCode : undefined }),
      });

      if (!response.ok) throw new Error('Failed to create checkout');

      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Upgrade error:', err);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Computed values for UI
  const isSuperPremium = currentTier === 'super-premium';
  const status = {
    isPremium: currentTier !== 'free',
    daysRemaining: null as number | null,
  };

  return (
    <AppLayout>
      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">⚠️</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Subscription?</h3>
                <p className="text-slate-500">
                  You'll keep access until the end of your billing period. Your subscription won't renew.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-200 transition font-semibold"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donation Modal */}
      <AnimatePresence>
        {showDonateModal && (
          <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDonateModal(false)}
          >
            <motion.div 
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">☕</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Support REEFXONE</h3>
                <p className="text-slate-500 text-sm">
                  Your donation helps keep this project alive and growing! 🐠💙
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-6">
                {[3, 5, 10, 25].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDonationAmount(amount)}
                    className={`py-3 rounded-xl font-semibold transition ${
                      donationAmount === amount
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDonateModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl hover:bg-slate-200 transition font-semibold"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleDonate}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition font-semibold disabled:opacity-50"
                >
                  {loading ? 'Loading...' : `Donate $${donationAmount}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient gradient-animate mb-4">
            Choose Your Plan
          </h1>
          <p className="text-slate-500 text-lg">
            Unlock the full power of REEFXONE
          </p>
        </motion.div>

        {/* Promo Code Input - Only show for free users */}
        {!status.isPremium && (
          <motion.div 
            className="mb-8 bg-white border border-slate-200 shadow-sm rounded-xl p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="text-xl">🎟️</span>
                  <span className="text-sm font-medium">Have a promo code?</span>
                </div>
                <div className="flex-1 flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      setPromoCodeValid(null);
                      setPromoCodeInfo(null);
                    }}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-[var(--aqua-accent-primary)]/50 focus:outline-none text-sm"
                  />
                  <button
                    onClick={validatePromoCode}
                    disabled={validatingPromo || !promoCode.trim()}
                    className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-[var(--aqua-accent-primary)] rounded-xl hover:bg-cyan-500/30 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {validatingPromo ? '...' : 'Check'}
                  </button>
                </div>
              </div>
              
              {/* Show validated promo code info with redeem button */}
              {promoCodeValid === true && promoCodeInfo && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-green-400">
                    <span className="text-lg">✓</span>
                    <div>
                      <p className="font-semibold">{promoCodeInfo.discountDescription}</p>
                      <p className="text-xs text-green-400/70">from {promoCodeInfo.partner}</p>
                    </div>
                  </div>
                  <button
                    onClick={redeemPromoCode}
                    disabled={redeemingPromo}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {redeemingPromo ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        🎉 Activate Free Trial
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {promoCodeValid === false && (
                <div className="flex items-center gap-2 text-red-400 text-sm p-2 bg-red-500/10 rounded-lg">
                  <span>✗</span>
                  <span>Invalid or expired code</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              className="mb-8 bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-center border-green-500/30"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
                <span className="text-2xl">✓</span>
                {successMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Plan Status */}
        {status.isPremium && (
          <motion.div 
            className={`mb-8 bg-white border border-slate-200 shadow-sm rounded-xl p-6 shimmer ${isSuperPremium ? 'border-pink-500/50' : 'border-purple-500/50'}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="text-4xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {isSuperPremium ? '🚀' : '👑'}
                </motion.div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {isSuperPremium ? 'Super Premium Member' : 'Premium Member'}
                  </p>
                  <p className="text-sm text-slate-500">
                    Thank you for your support! 💙
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-slate-900 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Free Plan */}
          <motion.div 
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🐚</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-slate-500 mb-1">
                $0
              </div>
              <p className="text-slate-400 text-sm">Forever free</p>
            </div>

            <ul className="space-y-3 mb-6 text-sm">
              <li className="flex items-center gap-2 text-slate-600">
                <span className="text-green-400">✓</span>
                Basic parameter logging
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <span className="text-green-400">✓</span>
                30 days history
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <span className="text-green-400">✓</span>
                <span>Basic charts</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <span className="text-green-400">✓</span>
                <span>1 tank</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <span className="text-slate-400">•</span>
                <span>Ad-supported</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <span className="text-red-400">✗</span>
                <span>No photo storage</span>
              </li>
            </ul>

            {!status.isPremium && (
              <>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 text-center mb-3">
                  <p className="text-[var(--aqua-accent-primary)] font-semibold text-sm">✓ Current Plan</p>
                </div>
                <button
                  onClick={() => setShowDonateModal(true)}
                  className="w-full py-2 text-center text-slate-500 hover:text-amber-400 transition text-sm"
                >
                  ☕ Buy me a coffee
                </button>
              </>
            )}
          </motion.div>

          {/* Premium Plan */}
          <motion.div 
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden border-2 border-purple-500/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute top-3 right-3">
              <span className="shimmer bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl mb-3">👑</div>
              <h3 className="text-xl font-bold text-gradient mb-2">Premium</h3>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                $4.99
                <span className="text-lg font-normal text-slate-500">/mo</span>
              </div>
              <p className="text-slate-500 text-sm">For dedicated hobbyists</p>
            </div>

            <ul className="space-y-3 mb-6 text-sm">
              <li className="flex items-center gap-2 text-slate-900">
                <span className="text-purple-400">✓</span>
                Everything in Free
              </li>
              <li className="flex items-center gap-2 text-slate-900 font-semibold">
                <span className="text-purple-400">✓</span>
                No ads
              </li>
              <li className="flex items-center gap-2 text-slate-900">
                <span className="text-purple-400">✓</span>
                Unlimited history
              </li>
              <li className="flex items-center gap-2 text-slate-900">
                <span className="text-purple-400">✓</span>
                500MB photo storage
              </li>
              <li className="flex items-center gap-2 text-slate-900">
                <span className="text-purple-400">✓</span>
                Data export (CSV/PDF)
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <span className="text-slate-400">•</span>
                1 tank only
              </li>
            </ul>

            {status.isPremium && !isSuperPremium ? (
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-3 text-center">
                <p className="text-purple-400 font-semibold text-sm flex items-center justify-center gap-2">
                  👑 Current Plan
                </p>
              </div>
            ) : !status.isPremium ? (
              <motion.button
                onClick={() => handleUpgradePremium(1)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Upgrade Now
              </motion.button>
            ) : null}
          </motion.div>

          {/* Super Premium Plan */}
          <motion.div 
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 relative overflow-hidden border-2 border-pink-500/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute top-3 right-3">
              <span className="shimmer bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                ULTIMATE
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">Super Premium</h3>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                $9.99
                <span className="text-lg font-normal text-slate-500">/mo</span>
              </div>
              <p className="text-slate-500 text-sm">For serious reefers</p>
            </div>

            <ul className="space-y-3 mb-6 text-sm">
              <li className="flex items-center gap-2 text-slate-900">
                <span className="text-pink-400">✓</span>
                Everything in Premium
              </li>
              <li className="flex items-center gap-2 text-slate-900 font-semibold">
                <span className="text-pink-400">✓</span>
                5GB photo storage
              </li>
              <li className="flex items-center gap-2 text-slate-900 font-semibold">
                <span className="text-pink-400">✓</span>
                Up to 10 tanks
              </li>
              <li className="flex items-center gap-2 text-slate-900">
                <span className="text-pink-400">✓</span>
                Equipment tracking
              </li>
              <li className="flex items-center gap-2 text-slate-900">
                <span className="text-pink-400">✓</span>
                Livestock inventory
              </li>
              <li className="flex items-center gap-2 text-slate-900">
                <span className="text-pink-400">✓</span>
                SMS alerts
              </li>
              <li className="flex items-center gap-2 text-slate-900">
                <span className="text-pink-400">✓</span>
                Community profiles
              </li>
            </ul>

            {isSuperPremium ? (
              <div className="bg-pink-500/20 border border-pink-500/50 rounded-xl p-3 text-center">
                <p className="text-pink-400 font-semibold text-sm flex items-center justify-center gap-2">
                  🚀 Current Plan
                </p>
              </div>
            ) : (
              <motion.button
                onClick={() => handleUpgradeSuperPremium(1)}
                className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white rounded-xl font-semibold transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Upgrade to Super
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Annual Options - Show different options based on tier */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center mb-6">
            <span className="inline-block bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm font-bold px-4 py-1 rounded-full shimmer">
              💰 SAVE WITH ANNUAL
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Premium Annual - Show for free tier only */}
            {!status.isPremium && (
              <motion.div 
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 border-orange-500/30"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="text-3xl">👑</div>
                  <p className="text-lg font-bold text-slate-900">
                    Premium Annual
                  </p>
                  <div className="space-y-1">
                    <p className="text-slate-500">
                      <span className="line-through text-slate-400">$59.88</span>
                      <span className="text-orange-400 font-bold text-2xl ml-2">$47.99</span>
                      <span className="text-slate-500 text-sm">/year</span>
                    </p>
                    <span className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                      Save 20%
                    </span>
                  </div>
                  <motion.button
                    onClick={() => handleUpgradePremium(12)}
                    className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-xl font-semibold transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Annual Premium
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Super Premium Annual - Show for free and premium tiers */}
            {!isSuperPremium && (
              <motion.div 
                className={`bg-white border border-slate-200 shadow-sm rounded-2xl p-6 border-pink-500/30 ${status.isPremium && !isSuperPremium ? 'md:col-span-2 max-w-md mx-auto w-full' : ''}`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="text-3xl">🚀</div>
                  <p className="text-lg font-bold text-slate-900">
                    Super Premium Annual
                  </p>
                  <div className="space-y-1">
                    <p className="text-slate-500">
                      <span className="line-through text-slate-400">$119.88</span>
                      <span className="text-pink-400 font-bold text-2xl ml-2">$99.99</span>
                      <span className="text-slate-500 text-sm">/year</span>
                    </p>
                    <span className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                      Save 17%
                    </span>
                  </div>
                  <motion.button
                    onClick={() => handleUpgradeSuperPremium(12)}
                    className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white rounded-xl font-semibold transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {status.isPremium ? 'Upgrade to Annual Super' : 'Get Annual Super'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Features Comparison */}
        <motion.div 
          className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Super Premium Features
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: '📸', title: 'Photo Gallery', desc: 'Track coral growth & tank progression with 5GB storage' },
              { icon: '🐠', title: 'Livestock Tracking', desc: 'Complete inventory of fish, corals & inverts' },
              { icon: '🔧', title: 'Equipment Manager', desc: 'Track all gear, warranties & purchase history' },
              { icon: '🏢', title: 'Multi-Tank', desc: 'Manage multiple aquariums in one account' }
            ].map((feature, i) => (
              <motion.div 
                key={feature.title}
                className="text-center p-4 rounded-xl hover:bg-slate-50 transition"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="text-5xl mb-4"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: i * 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h4 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-500">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Demo Note */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-slate-400">
            🔒 Secure payments powered by Stripe
          </p>
        </motion.div>

        {/* Dev Tools - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div 
            className="mt-12 bg-white border border-slate-200 shadow-sm rounded-xl p-6 border-yellow-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🛠️</span>
              <h3 className="text-lg font-bold text-yellow-400">Dev Tools</h3>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">DEV ONLY</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">Quick tier switching for testing:</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => manualUpdateTier('free')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  currentTier === 'free' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🐚 Free
              </button>
              <button
                onClick={() => manualUpdateTier('premium')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  currentTier === 'premium' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                👑 Premium
              </button>
              <button
                onClick={() => manualUpdateTier('super-premium')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  currentTier === 'super-premium' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🚀 Super Premium
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3">Current tier: <span className="text-slate-900 font-mono">{currentTier}</span></p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
