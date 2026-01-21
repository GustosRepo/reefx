"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSupabaseRecovery, setIsSupabaseRecovery] = useState(false);
  
  // Get params - supports both custom flow (token/email) and Supabase flow (type=recovery)
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const type = searchParams.get("type");

  useEffect(() => {
    const checkSession = async () => {
      // Check if this is a Supabase recovery flow
      if (type === "recovery") {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User has a valid session from the recovery link
          setIsSupabaseRecovery(true);
          setInitializing(false);
          return;
        }
      }
      
      // Custom flow - validate that we have the required params
      if (!token || !email) {
        if (type !== "recovery") {
          setError("Invalid or missing reset token. Please request a new password reset link.");
        }
      }
      setInitializing(false);
    };
    
    checkSession();
  }, [token, email, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseRecovery) {
        // Use Supabase's updateUser for recovery flow
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          throw new Error(updateError.message);
        }
        
        // Sign out after password reset so they can log in fresh
        await supabase.auth.signOut();
      } else {
        // Use custom API for token-based flow
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to reset password");
        }
      }

      setSuccess(true);
      toast.success("Password reset successfully!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c5e6ee] via-[#d4eef4] to-[#c5e6ee] text-slate-800 relative overflow-hidden flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[var(--aqua-accent-primary)]/30 border-t-[var(--aqua-accent-primary)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (error && !isSupabaseRecovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c5e6ee] via-[#d4eef4] to-[#c5e6ee] text-slate-800 relative overflow-hidden flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8 text-center">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Invalid Link</h1>
            <p className="text-slate-500 mb-6">{error}</p>
            <Link
              href="/forgot-password"
              className="inline-block w-full py-3 rounded-xl bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition text-center"
            >
              Request New Link
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#c5e6ee] via-[#d4eef4] to-[#c5e6ee] text-slate-800 relative overflow-hidden flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-6"
            >
              ✅
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Password Reset!</h1>
            <p className="text-slate-500 mb-6">
              Your password has been successfully reset. Redirecting you to login...
            </p>
            <div className="w-8 h-8 border-2 border-[var(--aqua-accent-primary)]/30 border-t-[var(--aqua-accent-primary)] rounded-full animate-spin mx-auto" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c5e6ee] via-[#d4eef4] to-[#c5e6ee] text-slate-800 relative overflow-hidden flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">🌊 AQUAXONE</h1>
        </Link>

        <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
            <p className="text-slate-500">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-gray-500 focus:border-[var(--aqua-accent-primary)] focus:ring-1 focus:ring-[var(--aqua-accent-primary)]/20 transition"
                placeholder="••••••••"
                minLength={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-gray-500 focus:border-[var(--aqua-accent-primary)] focus:ring-1 focus:ring-[var(--aqua-accent-primary)]/20 transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-slate-500 hover:text-[var(--aqua-accent-primary)] transition"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--aqua-accent-primary)]/30 border-t-[var(--aqua-accent-primary)] rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
