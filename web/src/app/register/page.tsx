"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/utils/auth";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      router.push("/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8 animate-slideDown">
          <h1 className="text-5xl font-bold text-gradient mb-2">REEFXONE</h1>
          <p className="text-gray-400 text-lg">Create your account</p>
        </div>

        {/* Registration Form */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 md:p-8 hover:border-cyan-500/50 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
              <p className="text-gray-500 text-xs mt-1">At least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cyan-400 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-lg font-semibold text-base transition ${
                isLoading
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white active:from-cyan-600 active:to-blue-600"
              }`}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-400 text-sm hover:text-white transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
