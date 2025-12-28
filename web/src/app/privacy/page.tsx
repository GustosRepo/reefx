"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen reef-bg">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gradient">
            REEFXONE
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/learn" className="text-gray-400 hover:text-white transition">
              Learn
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white transition">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <motion.main 
        className="max-w-4xl mx-auto px-4 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-lg max-w-none space-y-6">
          <p className="text-gray-400">Last updated: December 22, 2024</p>

          <section className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">1. Introduction</h2>
            <p className="text-gray-300">
              REEFXONE ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our reef aquarium management application and website.
            </p>
          </section>

          <section className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Email address (for account creation and communication)</li>
              <li>Name (optional, for personalization)</li>
              <li>Payment information (processed securely via Stripe)</li>
            </ul>
            
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">Aquarium Data</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Water parameter logs (temperature, salinity, pH, etc.)</li>
              <li>Livestock inventory</li>
              <li>Equipment records</li>
              <li>Maintenance logs</li>
              <li>Photos you upload to the gallery</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">Usage Data</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Device type and browser information</li>
              <li>IP address</li>
              <li>Pages visited and features used</li>
              <li>Time spent on the application</li>
            </ul>
          </section>

          <section className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Process your subscription and payments</li>
              <li>Send you important updates about your account</li>
              <li>Improve our application based on usage patterns</li>
              <li>Provide customer support</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">4. Data Storage & Security</h2>
            <p className="text-gray-300">
              Your data is stored securely using Supabase, which provides enterprise-grade security including encryption at rest and in transit. We implement appropriate technical and organizational measures to protect your personal information.
            </p>
          </section>

          <section className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">5. Data Sharing</h2>
            <p className="text-gray-300 mb-4">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Service providers</strong> - Companies that help us operate (payment processing, hosting)</li>
              <li><strong>Legal requirements</strong> - When required by law or to protect our rights</li>
              <li><strong>Business transfers</strong> - In connection with a merger or acquisition</li>
            </ul>
          </section>

          <section className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">6. Your Rights</h2>
            <p className="text-gray-300 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">7. Cookies</h2>
            <p className="text-gray-300">
              We use essential cookies to maintain your session and preferences. We may use analytics cookies to understand how our service is used. You can control cookie settings through your browser.
            </p>
          </section>

          <section className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-300">
              Our service is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">10. Contact Us</h2>
            <p className="text-gray-300">
              If you have questions about this Privacy Policy, please contact us at privacy@reefxone.com
            </p>
          </section>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition">
            ← Back to Home
          </Link>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-sm">
            © 2024 REEFXONE. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/learn" className="text-gray-400 hover:text-white transition">
              Guides
            </Link>
            <Link href="/privacy" className="text-cyan-400">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
