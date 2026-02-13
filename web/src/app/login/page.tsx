"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { login } from "@/utils/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // After successful login, check if user is admin and redirect accordingly
      try {
        const res = await fetch('/api/admin/check');
        if (res.ok) {
          const body = await res.json();
          if (body.isAdmin) {
            router.push('/admin/promo-codes');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || "Login failed");
    }

    setIsLoading(false);
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
      
      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/">
            <h1 className="text-5xl font-bold text-gradient gradient-animate mb-2 flex items-center justify-center gap-3">
              <span>🫧</span>
              AQUAXONE
            </h1>
          </Link>
          <p className="text-slate-500 text-lg">Sign in to your account</p>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          className="bg-white border border-slate-200 shadow-lg rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                className="bg-red-50 border border-red-200 rounded-xl p-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[var(--aqua-accent-primary)] focus:ring-1 focus:ring-[var(--aqua-accent-primary)] transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-[var(--aqua-accent-primary)] hover:text-[var(--aqua-accent-secondary)] transition"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[var(--aqua-accent-primary)] focus:ring-1 focus:ring-[var(--aqua-accent-primary)] transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-[var(--aqua-accent-primary)] hover:text-[var(--aqua-accent-secondary)] font-semibold transition">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-slate-500 text-sm hover:text-slate-900 transition">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
