"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b backdrop-blur bg-black/70 border-white/10">
        <div className="flex items-center justify-between max-w-6xl px-6 py-4 mx-auto">
          <div className="text-2xl font-bold text-gradient">REEFXONE</div>
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-300">
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
        <div className="absolute inset-0 z-0 opacity-50 bg-gradient-radial from-cyan-500/10 via-black to-black blur-2xl animate-pulse-slow" />

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
                className="inline-block px-8 py-4 mt-6 font-semibold text-white shadow-2xl bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl hover:shadow-cyan-500/50 transition-all duration-300"
              >
                Get Started Free
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="inline-block px-8 py-4 mt-6 font-semibold text-cyan-400 border-2 border-cyan-500 rounded-2xl hover:bg-cyan-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30"
              >
                Sign In
              </Link>
            </motion.div>
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
                alt="REEFX App Mobile Preview"
                className="relative z-10 object-cover object-top w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section id="beta" className="py-20 text-white bg-black border-t border-white/10">
        <div className="max-w-4xl px-6 mx-auto space-y-6 text-center">
          <h2 className="text-3xl font-bold">
            Be the first to experience smarter reefkeeping.
          </h2>
          <p className="text-gray-400">
            Sign up now to join the REEFX beta and track your tank like never before.
          </p>
          <a
            href="mailto:admin@code-wrx.com?subject=REEFX%20Beta%20Signup&body=Hi%20there%2C%0A%0AI%E2%80%99d%20love%20to%20join%20the%20REEFX%20beta!%20Let%20me%20know%20what%20you%20need%20from%20me.%0A%0AThanks%20so%20much%2C%0A%5Byour%20name%5D"
            className="inline-block px-6 py-3 mt-6 font-semibold text-white transition-transform rounded-md shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105"
          >
            Email Us to Join Beta
          </a>
        </div>
      </section>

      <div className="mt-24 text-sm italic text-center text-white/50">
        v2 Features Coming Soon: Automated dosing, AI alerts, multi-tank sync...
      </div>

      {/* Footer */}
      <footer className="py-6 text-sm text-center text-gray-500 bg-black">
        &copy; {new Date().getFullYear()} REEFX. Built for reefers, by reefers.
      </footer>
    </>
  );
}