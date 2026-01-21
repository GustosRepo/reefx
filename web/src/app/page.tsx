"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroStats = [
    { label: "7d stability", value: "98.2%", icon: "✨" },
    { label: "Last test", value: "Today, 8:15 AM", icon: "🧪" },
    { label: "Livestock", value: "24 tracked", icon: "🛡️" },
  ];

  const sparklinePath = "M0 18 C20 12,40 22,60 14 S100 8,120 16";

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b backdrop-blur bg-white/80 border-slate-200">
        <div className="flex items-center justify-between max-w-6xl px-4 sm:px-6 py-4 mx-auto">
          <div className="text-xl sm:text-2xl font-bold text-gradient flex items-center gap-2">
            <span>🌊</span>
            AQUAXONE
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
            <a href="#pricing" className="transition hover:text-slate-900">Pricing</a>
            <Link href="/pricing" className="transition hover:text-slate-900">Compare Plans</Link>
            <Link href="/learn" className="transition hover:text-slate-900">📚 Guides</Link>
            <Link href="/login" className="transition hover:text-slate-900">Sign In</Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white rounded-lg transition hover:opacity-90"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg bg-slate-100 border border-slate-200"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
            <span className={`block w-5 h-0.5 bg-slate-700 my-1 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur overflow-hidden"
            >
              <div className="flex flex-col px-4 py-4 space-y-3 text-sm font-medium text-slate-600">
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 transition hover:text-slate-900">Pricing</a>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 transition hover:text-slate-900">Compare Plans</Link>
                <Link href="/learn" onClick={() => setMobileMenuOpen(false)} className="py-2 transition hover:text-slate-900">📚 Guides</Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-2 transition hover:text-slate-900">Sign In</Link>
                <Link 
                  href="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white rounded-lg transition hover:opacity-90"
                >
                  Get Started
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <main className="relative min-h-screen px-6 pt-48 pb-24 overflow-hidden text-slate-800 bg-gradient-to-b from-[#b8dfe9] via-[#c5e6ee] to-[#d4eef4]">
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
        <div className="water-surface" />
        
        {/* Static Coral & Plant Decorations for Hero */}
        <div className="hero-coral-decor">
          {/* Corals */}
          <div className="coral-branch-left" />
          <div className="coral-fan-right" />
          <div className="coral-brain" />
          <div className="coral-tubes" />
          <div className="coral-mushroom-1" />
          <div className="coral-mushroom-2" />
          {/* Seaweed */}
          <div className="seaweed-left" />
          <div className="seaweed-right" />
          {/* Anemone */}
          <div className="anemone" />
          {/* Bottom elements */}
          <div className="sandy-bottom" />
          <div className="pebbles" />
        </div>
        
        {/* Aquatic Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-40 bg-gradient-radial from-cyan-300/50 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(8,145,178,0.15),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(20,184,166,0.15),transparent_32%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.12),transparent_30%)]" />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 z-0 opacity-8 bg-[linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Animated Bubbles */}
        <div className="absolute w-4 h-4 rounded-full bottom-20 left-1/4 bg-cyan-400/40 blur-sm animate-ping" />
        <div className="absolute w-3 h-3 bg-teal-400/30 rounded-full top-32 right-1/3 blur-sm animate-pulse" />
        <div className="absolute top-1/2 left-[70%] w-2 h-2 bg-emerald-400/40 rounded-full blur-sm animate-ping" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl font-bold text-gradient gradient-animate"
          >
            AQUAXONE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-xl mx-auto text-xl md:text-2xl text-slate-600"
          >
            Smarter Aquarium Keeping. Beautifully Synced.
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
                className="inline-flex items-center gap-2 px-8 py-4 mt-6 font-semibold text-white shadow-xl bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] rounded-2xl hover:shadow-cyan-500/30 transition-all duration-300"
              >
                🚀 Get Started Free
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 mt-6 font-semibold text-[var(--aqua-accent-primary)] border-2 border-[var(--aqua-accent-primary)]/50 rounded-2xl hover:bg-[var(--aqua-accent-primary)]/10 transition-all duration-300"
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
            <div className="relative p-5 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-100/30 via-teal-100/20 to-emerald-100/30 blur-2xl" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--aqua-accent-primary)]">Live snapshot</p>
                  <h3 className="text-xl font-semibold text-slate-900">Stable tank, at a glance</h3>
                  <p className="text-sm text-slate-500 mt-1">Real-time health, latest tests, and livestock rollup.</p>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-slate-700">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                      <span className="text-amber-500">⚡</span>
                      Automated logging
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                      <span className="text-emerald-500">🛡️</span>
                      Alerts & thresholds
                    </span>
                  </div>
                </div>
                <div className="hidden md:block w-px h-28 bg-slate-200" />
                <div className="flex-1 space-y-3">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-[var(--aqua-accent-primary)]" aria-hidden>{stat.icon}</span>
                        <span className="text-slate-500">{stat.label}</span>
                      </div>
                      <span className="text-slate-900 font-semibold">{stat.value}</span>
                    </div>
                  ))}
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 mb-1">Stability trend (last 7d)</p>
                    <svg viewBox="0 0 120 32" className="w-full h-12">
                      <path d="M0 31 L120 31" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                      <path d="M0 16 L120 16" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                      <path d={sparklinePath} fill="none" stroke="var(--aqua-accent-primary)" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="120" cy="16" r="3" fill="var(--aqua-accent-primary)" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-lg flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-100/30 via-cyan-100/20 to-transparent blur-2xl" />
              <div className="relative p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Live preview</p>
                  <h3 className="text-lg font-semibold text-slate-900">In-app dashboards</h3>
                  <p className="text-xs text-slate-500">Mini views of the real UI</p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-slate-100 border border-slate-200 text-slate-600">v2 preview</span>
              </div>
              <div className="relative flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                {/* Light Theme Dashboard Mockup */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--aqua-accent-primary)]" />
                    <span className="text-[10px] font-semibold text-slate-700">AQUAXONE</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mb-2">Your reef parameters at a glance</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-slate-50 rounded p-1.5 border border-slate-100">
                      <p className="text-[8px] text-slate-400">TOTAL LOGS</p>
                      <p className="text-sm font-bold text-slate-800">3</p>
                    </div>
                    <div className="bg-slate-50 rounded p-1.5 border border-slate-100">
                      <p className="text-[8px] text-slate-400">TEMPERATURE</p>
                      <p className="text-sm font-bold text-slate-800">77.8°F</p>
                    </div>
                  </div>
                  <div className="h-8 bg-gradient-to-r from-[var(--aqua-accent-primary)]/20 to-[var(--aqua-accent-tertiary)]/20 rounded flex items-end p-1">
                    <div className="w-full h-4 bg-gradient-to-t from-[var(--aqua-accent-primary)]/40 to-transparent rounded" />
                  </div>
                  <p className="absolute bottom-2 left-3 text-xs text-slate-600 font-medium">Dashboard overview</p>
                </div>
                {/* Light Theme Trends Mockup */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-slate-700">Temperature</span>
                    <span className="text-[8px] text-slate-400">Last 7 days</span>
                  </div>
                  <div className="h-16 relative">
                    <svg className="w-full h-full" viewBox="0 0 100 40">
                      <path d="M0 35 L15 30 L30 32 L45 25 L60 28 L75 20 L90 22 L100 18" fill="none" stroke="var(--aqua-accent-primary)" strokeWidth="2" strokeLinecap="round" />
                      <path d="M0 35 L15 30 L30 32 L45 25 L60 28 L75 20 L90 22 L100 18 L100 40 L0 40 Z" fill="url(#chartGradient)" opacity="0.3" />
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="var(--aqua-accent-primary)" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-400 mt-1">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                  <p className="absolute bottom-2 left-3 text-xs text-slate-600 font-medium">Trend tracking</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="py-24 text-slate-900 bg-[#d4eef4] relative overflow-hidden">
        {/* Decorative bubbles for this section */}
        <div className="absolute bottom-10 left-10 w-6 h-6 rounded-full bg-[var(--aqua-accent-primary)]/20 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-20 right-20 w-4 h-4 rounded-full bg-[var(--aqua-accent-tertiary)]/20 animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 left-5 w-3 h-3 rounded-full bg-emerald-400/20 animate-pulse" />
        
        <div className="max-w-6xl px-6 mx-auto space-y-16 relative z-10">
          <h2 className="text-4xl font-bold text-center text-gradient">
            Powerful Features for Every Aquarist
          </h2>

          <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-md rounded-xl bg-white border-slate-200 hover:scale-105 hover:shadow-lg"
            >
              <h3 className="mb-2 text-xl font-semibold text-slate-900">📊 Parameter Tracking</h3>
              <p className="text-slate-500">Log ALK, Ca, Mg, NO₃, PO₄ and more — all in one place.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-md rounded-xl bg-white border-slate-200 hover:scale-105 hover:shadow-lg"
            >
              <h3 className="mb-2 text-xl font-semibold text-slate-900">📈 Trend Analysis</h3>
              <p className="text-slate-500">Visualize your data and spot changes before they spike or crash.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-md rounded-xl bg-white border-slate-200 hover:scale-105 hover:shadow-lg"
            >
              <h3 className="mb-2 text-xl font-semibold text-slate-900">📂 Historical Records</h3>
              <p className="text-slate-500">Look back at past test results and see how your tank has progressed over time.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 text-slate-900 bg-[#c5e6ee] border-t border-slate-200 relative overflow-hidden">
        {/* Decorative coral/plant silhouette */}
        <div className="aqua-decor opacity-30" style={{ bottom: 0, height: '120px' }} />
        
        <div className="max-w-5xl px-6 mx-auto space-y-16 text-center relative z-10">
          <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          <div className="grid grid-cols-1 gap-12 text-left md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-md rounded-xl bg-white border-slate-200 hover:scale-105 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900">🔬 Step 1: Test & Log</h3>
              <p className="text-slate-500">Input your ALK, Ca, Mg, and nutrient levels in seconds.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-md rounded-xl bg-white border-slate-200 hover:scale-105 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900">📊 Step 2: Spot Trends</h3>
              <p className="text-slate-500">Get quick visuals so you catch dips or spikes early.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 transition-transform border shadow-md rounded-xl bg-white border-slate-200 hover:scale-105 hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold text-slate-900">🚀 Step 3: Keep Stability</h3>
              <p className="text-slate-500">Use trends to guide your dosing and feeding habits.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 text-slate-900 bg-white border-t border-slate-200 relative overflow-hidden">
        {/* Decorative light rays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-[var(--aqua-accent-primary)]/10 to-transparent transform -rotate-12" />
          <div className="absolute top-0 right-1/3 w-px h-40 bg-gradient-to-b from-[var(--aqua-accent-tertiary)]/10 to-transparent transform rotate-12" />
        </div>
        <div className="absolute bottom-20 right-10 w-5 h-5 rounded-full bg-[var(--aqua-accent-primary)]/15 animate-ping" style={{ animationDuration: '5s' }} />
        
        <div className="max-w-6xl px-6 mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gradient mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-500 text-lg">Start free, upgrade when you&apos;re ready</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl border border-slate-200 bg-white shadow-md hover:border-[var(--aqua-accent-primary)]/30 transition-all"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🐚</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-slate-700 mb-1">$0</div>
                <p className="text-slate-400 text-sm">Forever free</p>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="text-emerald-500">✓</span> Basic parameter logging
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="text-emerald-500">✓</span> Reef & freshwater modes
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="text-emerald-500">✓</span> 30 days history
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="text-emerald-500">✓</span> Basic charts
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="text-emerald-500">✓</span> 1 tank
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span className="text-slate-400">•</span> Ad-supported
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-200 transition mb-3"
              >
                Get Started Free
              </Link>
              <Link
                href="/subscription?donate=true"
                className="block w-full py-2 text-center text-slate-400 hover:text-amber-500 transition text-sm"
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
              className="p-8 rounded-2xl border-2 border-[var(--aqua-accent-primary)] bg-white shadow-lg relative overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">👑</div>
                <h3 className="text-xl font-bold text-gradient mb-2">Premium</h3>
                <div className="text-4xl font-bold text-slate-900 mb-1">
                  $4.99<span className="text-lg font-normal text-slate-400">/mo</span>
                </div>
                <p className="text-slate-400 text-sm">or $47.99/year (save 20%)</p>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-[var(--aqua-accent-primary)]">✓</span> Everything in Free
                </li>
                <li className="flex items-center gap-2 text-slate-900 font-semibold">
                  <span className="text-[var(--aqua-accent-primary)]">✓</span> No ads
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-[var(--aqua-accent-primary)]">✓</span> Unlimited history
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-[var(--aqua-accent-primary)]">✓</span> Up to 3 tanks
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-[var(--aqua-accent-primary)]">✓</span> 500MB photo storage
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-[var(--aqua-accent-primary)]">✓</span> Data export (CSV/PDF)
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center text-white bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] rounded-xl font-semibold hover:opacity-90 transition"
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
              className="p-8 rounded-2xl border-2 border-teal-400 bg-white shadow-md relative overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ULTIMATE
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text mb-2">Super Premium</h3>
                <div className="text-4xl font-bold text-slate-900 mb-1">
                  $9.99<span className="text-lg font-normal text-slate-400">/mo</span>
                </div>
                <p className="text-slate-400 text-sm">or $99.99/year (save 17%)</p>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-teal-500">✓</span> Everything in Premium
                </li>
                <li className="flex items-center gap-2 text-slate-900 font-semibold">
                  <span className="text-teal-500">✓</span> 5GB photo storage
                </li>
                <li className="flex items-center gap-2 text-slate-900 font-semibold">
                  <span className="text-teal-500">✓</span> Up to 5 tanks
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-teal-500">✓</span> Equipment tracking
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-teal-500">✓</span> Livestock inventory
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Go Super Premium
              </Link>
            </motion.div>
          </div>

          <p className="text-center text-slate-400 text-sm">
            All plans include a 7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </section>

      <section className="py-24 text-slate-900 bg-[#c5e6ee] border-t border-slate-200 relative overflow-hidden">
        {/* Water surface effect at top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-[var(--aqua-accent-primary)]/10 to-transparent" />
        <div className="absolute bottom-10 left-20 w-4 h-4 rounded-full bg-[var(--aqua-accent-primary)]/20 animate-ping" style={{ animationDuration: '4s' }} />
        
        <div className="max-w-4xl px-6 mx-auto space-y-8 text-center relative z-10">
          <h2 className="text-3xl font-bold text-slate-900">Preview the Mobile Experience</h2>
          <p className="max-w-xl mx-auto text-slate-500">
            Designed to be just as powerful on your phone. Track, log, and visualize your tank from anywhere.
          </p>
          <div className="flex justify-center">
            <div className="relative w-72 h-[580px] rounded-xl bg-white shadow-xl overflow-hidden border border-slate-200">
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-100/40 to-teal-100/30 blur-2xl" />
              <img
                src="/mock.png"
                alt="AQUAXONE mobile dashboard preview"
                className="relative z-10 object-cover object-top w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section id="join" className="py-20 text-slate-900 bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 border-t border-slate-200">
        <div className="max-w-4xl px-6 mx-auto space-y-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Ready to stabilize your tank today?
          </h2>
          <p className="text-slate-500">
            Create your account and start logging tests, trends, and livestock in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-transform rounded-xl shadow-lg bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] hover:scale-105"
            >
              Create your free account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 font-semibold text-[var(--aqua-accent-primary)] border-2 border-[var(--aqua-accent-primary)]/50 rounded-xl hover:bg-[var(--aqua-accent-primary)]/10 transition-transform hover:scale-105"
            >
              Sign in to your tank
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </>
  );
}