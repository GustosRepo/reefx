"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
export default function Home() {
  const heroStats = [
    { label: "7d stability", value: "98.2%", icon: "✨" },
    { label: "Last test", value: "Today, 8:15 AM", icon: "🧪" },
    { label: "Livestock", value: "24 tracked", icon: "🛡️" },
  ];

  const sparklinePath = "M0 18 C20 12,40 22,60 14 S100 8,120 16";

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b backdrop-blur bg-black/70 border-white/10">
        <div className="flex items-center justify-between max-w-6xl px-6 py-4 mx-auto">
          <div className="text-2xl font-bold text-gradient">REEFXONE</div>
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-300">
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <Link href="/learn" className="transition hover:text-white">📚 Guides</Link>
            <Link href="/login" className="transition hover:text-white">Sign In</Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg transition hover:from-cyan-600 hover:to-blue-600"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative min-h-screen px-6 pt-48 pb-24 overflow-hidden text-white bg-black">
        {/* Glowy Reef Background */}
        <div className="absolute inset-0 z-0 opacity-60 bg-gradient-radial from-cyan-400/15 via-black to-black blur-2xl animate-pulse-slow" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.1),transparent_30%)]" />
        <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] animate-[grid-move_18s_linear_infinite]" />

        {/* Animated Bubbles */}
        <div className="absolute w-6 h-6 rounded-full bottom-20 left-1/4 bg-cyan-400 blur-sm opacity-60 animate-ping" />
        <div className="absolute w-4 h-4 bg-blue-500 rounded-full top-32 right-1/3 blur-sm opacity-40 animate-pulse" />
        <div className="absolute top-1/2 left-[70%] w-3 h-3 bg-lime-300 rounded-full blur-sm opacity-40 animate-ping" />
        <div className="absolute w-5 h-5 rounded-full top-1/4 left-1/2 bg-purple-400 blur-sm opacity-30 animate-bounce" />
        <div className="absolute w-2 h-2 bg-cyan-300 rounded-full bottom-1/3 right-1/4 blur-sm opacity-50 animate-ping" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl font-bold text-gradient gradient-animate"
          >
            REEFXONE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-xl mx-auto text-xl md:text-2xl text-gray-300"
          >
            Smarter Reefkeeping. Beautifully Synced.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 mt-6 font-semibold text-white shadow-2xl bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl hover:shadow-cyan-500/50 transition-all duration-300"
              >
                🚀 Get Started Free
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 mt-6 font-semibold text-cyan-300 border-2 border-cyan-500/70 rounded-2xl hover:bg-cyan-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30"
              >
                🔒 Sign In
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.65 }}
            className="mt-10 grid gap-4 md:grid-cols-[1.2fr_1fr] items-stretch"
          >
            <div className="relative p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 blur-2xl" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Live snapshot</p>
                  <h3 className="text-xl font-semibold text-white">Stable reef, at a glance</h3>
                  <p className="text-sm text-gray-400 mt-1">Real-time health, latest tests, and livestock rollup.</p>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-200">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <span className="text-amber-300">⚡</span>
                      Automated logging
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      <span className="text-emerald-300">🛡️</span>
                      Alerts & thresholds
                    </span>
                  </div>
                </div>
                <div className="hidden md:block w-px h-28 bg-white/10" />
                <div className="flex-1 space-y-3">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-cyan-300" aria-hidden>{stat.icon}</span>
                        <span className="text-gray-400">{stat.label}</span>
                      </div>
                      <span className="text-white font-semibold">{stat.value}</span>
                    </div>
                  ))}
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Stability trend (last 7d)</p>
                    <svg viewBox="0 0 120 32" className="w-full h-12">
                      <path d="M0 31 L120 31" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                      <path d="M0 16 L120 16" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <path d={sparklinePath} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="120" cy="16" r="3" fill="#22d3ee" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-cyan-400/10 to-transparent blur-2xl" />
              <div className="relative p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-purple-300">Live preview</p>
                  <h3 className="text-lg font-semibold">In-app dashboards</h3>
                  <p className="text-xs text-gray-400">Mini views of the real UI</p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/10">v2 preview</span>
              </div>
              <div className="relative flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
                  <img src="/dashboard.jpg" alt="Dashboard preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <p className="absolute bottom-2 left-3 text-xs text-white">Dashboard overview</p>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
                  <img src="/trends.jpg" alt="Trends preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <p className="absolute bottom-2 left-3 text-xs text-white">Trend tracking</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="py-24 text-white bg-black">
        <div className="max-w-6xl px-6 mx-auto space-y-16">
          <h2 className="text-4xl font-bold text-center text-transparent bg-gradient-to-r from-lime-400 via-cyan-400 to-blue-500 bg-clip-text">
            Powerful Features for Every Reefer
          </h2>

          <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-inner rounded-xl bg-white/5 border-white/10 backdrop-blur hover:scale-105"
            >
              <h3 className="mb-2 text-xl font-semibold">📊 Parameter Tracking</h3>
              <p className="text-gray-400">Log ALK, Ca, Mg, NO₃, PO₄ and more — all in one place.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-inner rounded-xl bg-white/5 border-white/10 backdrop-blur hover:scale-105"
            >
              <h3 className="mb-2 text-xl font-semibold">📈 Trend Analysis</h3>
              <p className="text-gray-400">Visualize your data and spot changes before they spike or crash.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-inner rounded-xl bg-white/5 border-white/10 backdrop-blur hover:scale-105"
            >
              <h3 className="mb-2 text-xl font-semibold">📂 Historical Records</h3>
              <p className="text-gray-400">Look back at past test results and see how your reef has progressed over time.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 text-white bg-black border-t border-white/10">
        <div className="max-w-5xl px-6 mx-auto space-y-16 text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <div className="grid grid-cols-1 gap-12 text-left md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-inner rounded-xl bg-white/5 border-white/10 backdrop-blur hover:scale-105"
            >
              <h3 className="text-lg font-semibold">🔬 Step 1: Test & Log</h3>
              <p className="text-gray-400">Input your ALK, Ca, Mg, and nutrient levels in seconds.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-inner rounded-xl bg-white/5 border-white/10 backdrop-blur hover:scale-105"
            >
              <h3 className="text-lg font-semibold">📊 Step 2: Spot Trends</h3>
              <p className="text-gray-400">Get quick visuals so you catch dips or spikes early.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-inner rounded-xl bg-white/5 border-white/10 backdrop-blur hover:scale-105"
            >
              <h3 className="text-lg font-semibold">🚀 Step 3: Keep Stability</h3>
              <p className="text-gray-400">Use trends to guide your dosing and feeding habits.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 text-white bg-black border-t border-white/10">
        <div className="max-w-6xl px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 text-lg">Start free, upgrade when you&apos;re ready</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-cyan-500/30 transition-all"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🐚</div>
                <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-300 mb-1">$0</div>
                <p className="text-gray-500 text-sm">Forever free</p>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Basic parameter logging
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 30 days history
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> Basic charts
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 1 tank
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="text-gray-500">•</span> Ad-supported
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition mb-3"
              >
                Get Started Free
              </Link>
              <Link
                href="/subscription?donate=true"
                className="block w-full py-2 text-center text-gray-400 hover:text-amber-400 transition text-sm"
              >
                ☕ Buy me a coffee
              </Link>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border-2 border-purple-500/50 bg-white/5 backdrop-blur relative overflow-hidden hover:border-purple-400 transition-all"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">👑</div>
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">Premium</h3>
                <div className="text-4xl font-bold text-white mb-1">
                  $4.99<span className="text-lg font-normal text-gray-400">/mo</span>
                </div>
                <p className="text-gray-400 text-sm">or $47.99/year (save 20%)</p>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2 text-white">
                  <span className="text-purple-400">✓</span> Everything in Free
                </li>
                <li className="flex items-center gap-2 text-white font-semibold">
                  <span className="text-purple-400">✓</span> No ads
                </li>
                <li className="flex items-center gap-2 text-white">
                  <span className="text-purple-400">✓</span> Unlimited history
                </li>
                <li className="flex items-center gap-2 text-white">
                  <span className="text-purple-400">✓</span> 500MB photo storage
                </li>
                <li className="flex items-center gap-2 text-white">
                  <span className="text-purple-400">✓</span> Data export (CSV/PDF)
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition"
              >
                Start Premium
              </Link>
            </motion.div>

            {/* Super Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border-2 border-pink-500/50 bg-white/5 backdrop-blur relative overflow-hidden hover:border-pink-400 transition-all"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ULTIMATE
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text mb-2">Super Premium</h3>
                <div className="text-4xl font-bold text-white mb-1">
                  $9.99<span className="text-lg font-normal text-gray-400">/mo</span>
                </div>
                <p className="text-gray-400 text-sm">or $99.99/year (save 17%)</p>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2 text-white">
                  <span className="text-pink-400">✓</span> Everything in Premium
                </li>
                <li className="flex items-center gap-2 text-white font-semibold">
                  <span className="text-pink-400">✓</span> 5GB photo storage
                </li>
                <li className="flex items-center gap-2 text-white font-semibold">
                  <span className="text-pink-400">✓</span> Up to 10 tanks
                </li>
                <li className="flex items-center gap-2 text-white">
                  <span className="text-pink-400">✓</span> Equipment tracking
                </li>
                <li className="flex items-center gap-2 text-white">
                  <span className="text-pink-400">✓</span> Livestock inventory
                </li>
                <li className="flex items-center gap-2 text-white">
                  <span className="text-pink-400">✓</span> SMS alerts
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-xl font-semibold hover:from-pink-500 hover:via-purple-500 hover:to-blue-500 transition"
              >
                Go Super Premium
              </Link>
            </motion.div>
          </div>

          <p className="text-center text-gray-500 text-sm">
            All plans include a 7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </section>

      <section className="py-24 text-white bg-black border-t border-white/10">
        <div className="max-w-4xl px-6 mx-auto space-y-8 text-center">
          <h2 className="text-3xl font-bold">Preview the Mobile Experience</h2>
          <p className="max-w-xl mx-auto text-gray-400">
            Designed to be just as powerful on your phone. Track, log, and visualize your reef from anywhere.
          </p>
          <div className="flex justify-center">
            <div className="relative w-72 h-[580px] rounded-xl bg-white/5 backdrop-blur shadow-2xl overflow-hidden">
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 blur-2xl" />
              <img
                src="/mock.png"
                alt="REEFXONE mobile dashboard preview"
                className="relative z-10 object-cover object-top w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section id="join" className="py-20 text-white bg-black border-t border-white/10">
        <div className="max-w-4xl px-6 mx-auto space-y-6 text-center">
          <h2 className="text-3xl font-bold">
            Ready to stabilize your reef today?
          </h2>
          <p className="text-gray-400">
            Create your account and start logging tests, trends, and livestock in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-transform rounded-md shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105"
            >
              Create your free account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 font-semibold text-cyan-300 border-2 border-cyan-500/70 rounded-md hover:bg-cyan-500/10 transition-transform hover:scale-105"
            >
              Sign in to your reef
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </>
  );
}