"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gradient">
            🫧 AQUAXONE
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/learn" className="text-slate-500 hover:text-slate-900 transition">
              Learn
            </Link>
            <Link href="/login" className="text-slate-500 hover:text-slate-900 transition">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white rounded-lg font-medium hover:opacity-90 transition"
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
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-slate-500">Last updated: December 22, 2024</p>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-600">
              By accessing or using AQUAXONE, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">2. Description of Service</h2>
            <p className="text-slate-600">
              AQUAXONE is a reef aquarium management application that allows users to track water parameters, manage livestock inventory, record maintenance tasks, and monitor equipment. The service is available in free and premium subscription tiers.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">3. Account Registration</h2>
            <p className="text-slate-600 mb-4">To use AQUAXONE, you must:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li>Be at least 13 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activity under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">4. Subscription & Payments</h2>
            <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Free Tier</h3>
            <p className="text-slate-600 mb-4">
              The free tier provides basic functionality with limited features and includes advertisements.
            </p>
            
            <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Premium Subscriptions</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li>Subscriptions are billed monthly or annually as selected</li>
              <li>Payment is processed securely through Stripe</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Refunds are handled according to our refund policy</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">Cancellation</h3>
            <p className="text-slate-600">
              You may cancel your subscription at any time. Access to premium features continues until the end of your current billing period.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">5. Acceptable Use</h2>
            <p className="text-slate-600 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Upload malicious code or attempt to hack the service</li>
              <li>Share your account credentials with others</li>
              <li>Attempt to access other users' data</li>
              <li>Circumvent any access restrictions or usage limits</li>
              <li>Use automated systems to access the service without permission</li>
              <li>Upload content that infringes on intellectual property rights</li>
            </ul>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">6. User Content</h2>
            <p className="text-slate-600 mb-4">
              You retain ownership of content you create using AQUAXONE (parameter logs, photos, notes, etc.). By using the service, you grant us a license to store and display your content as necessary to provide the service.
            </p>
            <p className="text-slate-600">
              You are responsible for ensuring you have the right to upload any photos or content you add to your account.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">7. Data & Privacy</h2>
            <p className="text-slate-600">
              Your use of AQUAXONE is also governed by our <Link href="/privacy" className="text-[var(--aqua-accent-primary)] hover:text-[var(--aqua-accent-primary)]">Privacy Policy</Link>, which describes how we collect, use, and protect your information.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-slate-600">
              AQUAXONE is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free. Recommendations and data provided by the service are for informational purposes only and should not replace professional aquarium care advice.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">9. Limitation of Liability</h2>
            <p className="text-slate-600">
              To the maximum extent permitted by law, AQUAXONE and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of livestock, equipment damage, or any other losses related to your aquarium.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">10. Service Modifications</h2>
            <p className="text-slate-600">
              We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will provide reasonable notice of significant changes when possible.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">11. Termination</h2>
            <p className="text-slate-600">
              We may terminate or suspend your account at any time for violation of these terms. Upon termination, your right to use the service ceases immediately. You may export your data before account deletion.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">12. Changes to Terms</h2>
            <p className="text-slate-600">
              We may update these Terms of Service from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify users of material changes via email or in-app notification.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">13. Governing Law</h2>
            <p className="text-slate-600">
              These terms shall be governed by the laws of the jurisdiction in which AQUAXONE operates, without regard to conflict of law principles.
            </p>
          </section>

          <section className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <h2 className="text-xl font-bold text-[var(--aqua-accent-primary)] mb-4">14. Contact</h2>
            <p className="text-slate-600">
              For questions about these Terms of Service, please contact us at legal@aquaxone.com
            </p>
          </section>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-[var(--aqua-accent-primary)] hover:text-[var(--aqua-accent-primary)] transition">
            ← Back to Home
          </Link>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            © 2024 AQUAXONE. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/learn" className="text-slate-500 hover:text-slate-900 transition">
              Guides
            </Link>
            <Link href="/privacy" className="text-slate-500 hover:text-slate-900 transition">
              Privacy
            </Link>
            <Link href="/terms" className="text-[var(--aqua-accent-primary)]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
