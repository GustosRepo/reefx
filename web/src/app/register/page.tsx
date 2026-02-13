"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { register } from "@/utils/auth";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const result = await register(email, password, name);

    if (result.success) {
      // If promo code was entered, try to redeem it after registration
      if (promoCode.trim()) {
        try {
          const promoResponse = await fetch('/api/promo-code/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: promoCode.trim() }),
          });
          
          if (!promoResponse.ok) {
            // Promo failed but registration succeeded - continue silently
          }
        } catch {
          // Promo error - continue silently
        }
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } else {
      setError(result.error || "Registration failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a8d4e0] via-[#b8dfe9] to-[#a8d4e0] text-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Aquatic Elements */}
      <div className="aqua-bubbles">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
        <div className="bubble bubble-5" />
      </div>
      <div className="light-rays" />
      <div className="aqua-decor" />
      
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="fixed inset-0 bg-[#a8d4e0]/90 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <motion.div 
                className="text-8xl mb-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.5 }}
              >
                🎉
              </motion.div>
              <p className="text-2xl font-bold text-slate-800">Welcome aboard!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold text-gradient gradient-animate mb-2 flex items-center justify-center gap-3">
            <span>🫧</span>
            AQUAXONE
          </h1>
          <p className="text-slate-500 text-lg">Create your account</p>
        </motion.div>

        {/* Registration Form */}
        <motion.div 
          className="bg-white border border-slate-200 shadow-lg rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="bg-red-50 border border-red-200 rounded-xl p-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-semibold text-[var(--aqua-accent-primary)] mb-2">
                👤 Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-base focus:outline-none focus:border-[var(--aqua-accent-primary)] focus:ring-2 focus:ring-[var(--aqua-accent-primary)]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--aqua-accent-primary)] mb-2">
                ✉️ Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-base focus:outline-none focus:border-[var(--aqua-accent-primary)] focus:ring-2 focus:ring-[var(--aqua-accent-primary)]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--aqua-accent-primary)] mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-base focus:outline-none focus:border-[var(--aqua-accent-primary)] focus:ring-2 focus:ring-[var(--aqua-accent-primary)]/20 transition-all"
              />
              <p className="text-slate-400 text-xs mt-1">At least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--aqua-accent-primary)] mb-2">
                🔒 Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-base focus:outline-none focus:border-[var(--aqua-accent-primary)] focus:ring-2 focus:ring-[var(--aqua-accent-primary)]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--aqua-accent-primary)] mb-2">
                🎁 Promo Code <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-base focus:outline-none focus:border-[var(--aqua-accent-primary)] focus:ring-2 focus:ring-[var(--aqua-accent-primary)]/20 transition-all uppercase"
              />
              <p className="text-slate-400 text-xs mt-1">Have a promo code? Get free Premium access!</p>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-semibold text-base transition ${
                isLoading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white shadow-md hover:shadow-lg"
              }`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--aqua-accent-primary)] hover:text-[var(--aqua-accent-secondary)] font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/" className="text-slate-500 text-sm hover:text-slate-900 transition">
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
