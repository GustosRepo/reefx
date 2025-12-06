"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSubscriptionStatus, activatePremium, activateSuperPremium, cancelPremium, hasSuperPremium } from "@/utils/subscription";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function SubscriptionPage() {
  return (
    <ProtectedRoute>
      <SubscriptionPageContent />
    </ProtectedRoute>
  );
}

function SubscriptionPageContent() {
  const router = useRouter();
  const [status, setStatus] = useState(getSubscriptionStatus());
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const isSuperPremium = hasSuperPremium();

  const handleUpgradePremium = (months: number) => {
    activatePremium(months);
    setStatus(getSubscriptionStatus());
    setSuccessMessage("Successfully upgraded to Premium!");
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleUpgradeSuperPremium = (months: number) => {
    activateSuperPremium(months);
    setStatus(getSubscriptionStatus());
    setSuccessMessage("Successfully upgraded to Super Premium! 🚀");
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel your subscription?")) {
      cancelPremium();
      setStatus(getSubscriptionStatus());
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-slideDown">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 text-lg">
            Upgrade to Premium for an ad-free experience
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-500/50 rounded-lg p-4 text-center animate-fadeIn">
            <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              {successMessage}
            </p>
          </div>
        )}

        {/* Current Plan Status */}
        {status.isPremium && (
          <div className={`mb-8 ${isSuperPremium ? 'bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-blue-900/30 border-pink-500/50' : 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50'} border rounded-lg p-6 animate-fadeIn`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{isSuperPremium ? '🚀' : '👑'}</div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {isSuperPremium ? 'Super Premium Member' : 'Premium Member'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {status.daysRemaining ? `${status.daysRemaining} days remaining` : "Active subscription"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Free Plan */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 relative">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Free</h3>
              <div className="text-3xl font-bold text-gray-400 mb-2">
                $0
                <span className="text-base font-normal">/month</span>
              </div>
              <p className="text-gray-500 text-xs">Perfect for beginners</p>
            </div>

            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Basic parameter logging</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>30 days history</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <span className="text-green-400">✓</span>
                <span>Basic charts</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <span className="text-red-400">✗</span>
                <span>Ads displayed</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <span className="text-red-400">✗</span>
                <span>No photo storage</span>
              </li>
            </ul>

            {!status.isPremium && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 text-center">
                <p className="text-cyan-400 font-semibold text-xs">Current Plan</p>
              </div>
            )}
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                POPULAR
              </span>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gradient mb-2">Premium</h3>
              <div className="text-3xl font-bold text-white mb-2">
                $4.99
                <span className="text-base font-normal">/month</span>
              </div>
              <p className="text-gray-400 text-xs">For dedicated hobbyists</p>
            </div>

            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2 text-white">
                <span className="text-green-400">✓</span>
                <span>Everything in Free</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <span className="text-green-400">✓</span>
                <span className="font-semibold">No ads</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <span className="text-green-400">✓</span>
                <span>Unlimited history</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <span className="text-green-400">✓</span>
                <span>500MB photo storage</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <span className="text-green-400">✓</span>
                <span>Data export (CSV/PDF)</span>
              </li>
            </ul>

            {status.isPremium && !isSuperPremium ? (
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-2 text-center">
                <p className="text-purple-400 font-semibold text-xs flex items-center justify-center gap-2">
                  <span>👑</span> Current Plan
                </p>
              </div>
            ) : !status.isPremium ? (
              <button
                onClick={() => handleUpgradePremium(1)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 text-sm"
              >
                Upgrade Now
              </button>
            ) : null}
          </div>

          {/* Super Premium Plan */}
          <div className="bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-blue-900/30 border-2 border-pink-500/50 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                ULTIMATE
              </span>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">Super Premium</h3>
              <div className="text-3xl font-bold text-white mb-2">
                $9.99
                <span className="text-base font-normal">/month</span>
              </div>
              <p className="text-gray-400 text-xs">For serious reefers</p>
            </div>

            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2 text-white">
                <span className="text-pink-400">✓</span>
                <span>Everything in Premium</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <span className="text-pink-400">✓</span>
                <span className="font-semibold">5GB photo storage</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <span className="text-pink-400">✓</span>
                <span className="font-semibold">Multi-tank management</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <span className="text-pink-400">✓</span>
                <span>Equipment tracking</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <span className="text-pink-400">✓</span>
                <span>Livestock inventory</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <span className="text-pink-400">✓</span>
                <span>SMS alerts</span>
              </li>
              <li className="flex items-center gap-2 text-white">
                <span className="text-pink-400">✓</span>
                <span>Community profiles</span>
              </li>
            </ul>

            {isSuperPremium ? (
              <div className="bg-pink-500/20 border border-pink-500/50 rounded-lg p-2 text-center">
                <p className="text-pink-400 font-semibold text-xs flex items-center justify-center gap-2">
                  <span>🚀</span> Current Plan
                </p>
              </div>
            ) : (
              <button
                onClick={() => handleUpgradeSuperPremium(1)}
                className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 text-sm"
              >
                Upgrade to Super
              </button>
            )}
          </div>
        </div>

        {/* Annual Options */}
        {!status.isPremium && (
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <div className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-500/30 rounded-lg p-4">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-base font-bold text-white">
                  Premium Annual
                </p>
                <p className="text-sm text-gray-400">
                  <span className="line-through">$59.88</span>
                  <span className="text-orange-400 font-bold ml-2">$47.99/year</span>
                </p>
                <p className="text-xs text-green-400 font-semibold">Save 20%</p>
                <button
                  onClick={() => handleUpgradePremium(12)}
                  className="w-full mt-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-yellow-700 transition text-sm"
                >
                  Get Annual Premium
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-900/20 via-purple-900/20 to-blue-900/20 border border-pink-500/30 rounded-lg p-4">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-base font-bold text-white">
                  Super Premium Annual
                </p>
                <p className="text-sm text-gray-400">
                  <span className="line-through">$119.88</span>
                  <span className="text-pink-400 font-bold ml-2">$99.99/year</span>
                </p>
                <p className="text-xs text-green-400 font-semibold">Save 17%</p>
                <button
                  onClick={() => handleUpgradeSuperPremium(12)}
                  className="w-full mt-2 px-6 py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 transition text-sm"
                >
                  Get Annual Super
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Comparison */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Super Premium Features
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📸</div>
              <h4 className="text-base font-semibold text-white mb-2">Photo Gallery</h4>
              <p className="text-xs text-gray-400">
                Track coral growth & tank progression with 5GB storage
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">🐠</div>
              <h4 className="text-base font-semibold text-white mb-2">Livestock Tracking</h4>
              <p className="text-xs text-gray-400">
                Complete inventory of fish, corals & inverts
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">🔧</div>
              <h4 className="text-base font-semibold text-white mb-2">Equipment Manager</h4>
              <p className="text-xs text-gray-400">
                Track all gear, warranties & purchase history
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">🏢</div>
              <h4 className="text-base font-semibold text-white mb-2">Multi-Tank</h4>
              <p className="text-xs text-gray-400">
                Manage multiple aquariums in one account
              </p>
            </div>
          </div>
        </div>

        {/* Demo Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 italic">
            Note: This is a demo subscription system. In production, integrate with Stripe, PayPal, or similar payment processor.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
