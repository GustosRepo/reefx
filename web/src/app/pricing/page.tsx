"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import SiteFooter from "@/components/SiteFooter";

type BillingCycle = "monthly" | "yearly";

type Feature = {
  name: string;
  free: boolean | string;
  premium: boolean | string;
  superPremium: boolean | string;
  description: string;
};

type FeatureCategory = {
  name: string;
  features: Feature[];
};

// Feature categories for organized comparison
const featureCategories: FeatureCategory[] = [
  {
    name: "Core Features",
    features: [
      { name: "Parameter Logging", free: true, premium: true, superPremium: true, description: "Log temp, salinity, alkalinity, pH, calcium, magnesium, phosphate, nitrate, and more" },
      { name: "Interactive Dashboard", free: true, premium: true, superPremium: true, description: "Real-time overview with status indicators, warnings, and quick actions" },
      { name: "Maintenance Tracking", free: true, premium: true, superPremium: true, description: "Schedule water changes, filter cleanings, dosing reminders with notifications" },
      { name: "Trend Charts", free: "Basic", premium: "Advanced", superPremium: "Advanced", description: "Visualize parameter trends over time with customizable date ranges" },
      { name: "Custom Thresholds", free: true, premium: true, superPremium: true, description: "Set min/max ranges for each parameter to get warnings when out of range" },
      { name: "Mobile App Access", free: true, premium: true, superPremium: true, description: "Full-featured iOS and Android apps synced with web" },
    ]
  },
  {
    name: "Data & History",
    features: [
      { name: "Parameter History", free: "30 days", premium: "Unlimited", superPremium: "Unlimited", description: "Access and analyze your historical water test data" },
      { name: "Maintenance History", free: "30 days", premium: "Unlimited", superPremium: "Unlimited", description: "Complete log of all maintenance tasks performed" },
      { name: "Data Export", free: "Basic CSV", premium: "CSV & PDF Reports", superPremium: "CSV & PDF Reports", description: "Export your data for backup, analysis, or sharing with others" },
      { name: "Parameter Insights", free: false, premium: true, superPremium: true, description: "AI-powered analysis of trends and recommendations" },
    ]
  },
  {
    name: "Tank Management",
    features: [
      { name: "Number of Tanks", free: "1 tank", premium: "Up to 3 tanks", superPremium: "Up to 5 tanks", description: "Manage multiple tanks with separate parameters and settings" },
      { name: "Tank Profiles", free: true, premium: true, superPremium: true, description: "Set tank size, type (reef, FOWLR, nano), and setup date" },
      { name: "Tank Comparison", free: false, premium: false, superPremium: true, description: "Compare parameters across multiple tanks side-by-side" },
    ]
  },
  {
    name: "Photo Gallery",
    features: [
      { name: "Photo Storage", free: false, premium: "500 MB", superPremium: "5 GB", description: "Document your tank's progress with dated photos" },
      { name: "Photo Tagging", free: false, premium: true, superPremium: true, description: "Tag photos with corals, fish, or custom labels" },
      { name: "Timeline View", free: false, premium: true, superPremium: true, description: "View tank evolution over time in a beautiful timeline" },
    ]
  },
  {
    name: "Inventory & Tracking",
    features: [
      { name: "Livestock Inventory", free: false, premium: false, superPremium: true, description: "Track all fish, corals, and invertebrates with species, cost, and health status" },
      { name: "Equipment Tracking", free: false, premium: false, superPremium: true, description: "Log pumps, lights, skimmers, heaters with purchase dates and warranty info" },
      { name: "Equipment Maintenance", free: false, premium: false, superPremium: true, description: "Schedule equipment maintenance and replacement reminders" },
      { name: "Cost Tracking", free: false, premium: false, superPremium: true, description: "Track spending on livestock, equipment, and supplies" },
    ]
  },
  {
    name: "Experience & Support",
    features: [
      { name: "Ad-Free Experience", free: false, premium: true, superPremium: true, description: "No banner ads or interruptions" },
      { name: "Email Support", free: "Standard", premium: "Priority", superPremium: "Priority", description: "Get help when you need it" },
      { name: "Early Access Features", free: false, premium: false, superPremium: true, description: "Be the first to try new features before public release" },
    ]
  },
];

// Flatten features for the all-features table
const features: Feature[] = featureCategories.flatMap(cat => cat.features);

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, you'll keep access until your current billing period ends."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal through our secure payment processor, Stripe."
  },
  {
    question: "Is there a free trial for Premium?",
    answer: "We offer a 7-day money-back guarantee on all paid plans. Try it risk-free!"
  },
  {
    question: "What happens to my data if I downgrade?",
    answer: "Your data is never deleted. If you downgrade, older history beyond 30 days becomes inaccessible (but not deleted), and extra tanks become read-only. Upgrade again to regain full access."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. No contracts, no hassle. Cancel anytime from your account settings and you won't be charged again."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 7-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund."
  },
  {
    question: "Do the mobile apps cost extra?",
    answer: "No! The iOS and Android apps are included free with all plans. Your data syncs seamlessly between web and mobile."
  },
  {
    question: "What parameters can I track?",
    answer: "You can log temperature, salinity, alkalinity, pH, calcium, magnesium, phosphate, nitrate, and add custom parameters for anything else you test."
  },
  {
    question: "Can I import data from other apps?",
    answer: "We're working on import tools for popular reef tracking apps. In the meantime, you can manually enter historical data or contact support for bulk import assistance."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption, secure authentication via Supabase, and never share your data with third parties. Your tank data is yours."
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5 text-green-500"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5 text-slate-400"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) return <CheckIcon />;
  if (value === false) return <XIcon />;
  return <span className="text-sm font-medium text-slate-900">{value}</span>;
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const prices = {
    free: { monthly: 0, yearly: 0 },
    premium: { monthly: 4.99, yearly: 47.99 },
    superPremium: { monthly: 9.99, yearly: 99.99 },
  };

  const savings = {
    premium: Math.round((1 - prices.premium.yearly / (prices.premium.monthly * 12)) * 100),
    superPremium: Math.round((1 - prices.superPremium.yearly / (prices.superPremium.monthly * 12)) * 100),
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b backdrop-blur bg-white/80 border-slate-200">
        <div className="flex items-center justify-between max-w-6xl px-4 sm:px-6 py-4 mx-auto">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-gradient">REEFXONE</Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/#pricing" className="transition hover:text-slate-900">Overview</Link>
            <Link href="/learn" className="transition hover:text-slate-900">📚 Guides</Link>
            <Link href="/login" className="transition hover:text-slate-900">Sign In</Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white rounded-lg transition hover:from-cyan-600 hover:to-blue-600"
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
            <span className={`block w-5 h-0.5 bg-slate-900 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
            <span className={`block w-5 h-0.5 bg-slate-900 my-1 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-slate-900 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
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
                <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 transition hover:text-slate-900">Overview</Link>
                <Link href="/learn" onClick={() => setMobileMenuOpen(false)} className="py-2 transition hover:text-slate-900">📚 Guides</Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="py-2 transition hover:text-slate-900">Sign In</Link>
                <Link 
                  href="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white rounded-lg transition hover:from-cyan-600 hover:to-blue-600"
                >
                  Get Started
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="min-h-screen pt-32 pb-24 text-slate-900 bg-slate-50">
        <div className="max-w-6xl px-6 mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text mb-4">
              Choose Your Plan
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Start free and upgrade when you need more. All plans include our core reef tracking features.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                  billingCycle === "monthly" 
                    ? "bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  billingCycle === "yearly" 
                    ? "bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Yearly
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Save up to {savings.premium}%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🐚</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-slate-600 mb-1">$0</div>
                <p className="text-slate-500 text-sm">Forever free</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="text-green-500">✓</span> Basic parameter logging
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="text-green-500">✓</span> 30 days history
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="text-green-500">✓</span> Basic charts
                </li>
                <li className="flex items-center gap-2 text-slate-600">
                  <span className="text-green-500">✓</span> 1 tank
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <span className="text-slate-400">•</span> Ad-supported
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-slate-100 border border-slate-200 rounded-xl font-semibold hover:bg-slate-200 transition text-slate-900"
              >
                Get Started Free
              </Link>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl border-2 border-purple-500/50 bg-white shadow-md relative flex flex-col"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">👑</div>
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">Premium</h3>
                <div className="text-4xl font-bold text-slate-900 mb-1">
                  ${billingCycle === "monthly" ? prices.premium.monthly : prices.premium.yearly}
                  <span className="text-lg font-normal text-slate-500">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                {billingCycle === "yearly" && (
                  <p className="text-green-400 text-sm">Save {savings.premium}% vs monthly</p>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-purple-500">✓</span> Everything in Free
                </li>
                <li className="flex items-center gap-2 text-slate-900 font-semibold">
                  <span className="text-purple-500">✓</span> No ads
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-purple-500">✓</span> Unlimited history
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-purple-500">✓</span> Up to 3 tanks
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-purple-500">✓</span> 500MB photo storage
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-purple-500">✓</span> Data export (CSV/PDF)
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-2xl border-2 border-pink-500/50 bg-white shadow-md relative flex flex-col"
            >
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ULTIMATE
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text mb-2">Super Premium</h3>
                <div className="text-4xl font-bold text-slate-900 mb-1">
                  ${billingCycle === "monthly" ? prices.superPremium.monthly : prices.superPremium.yearly}
                  <span className="text-lg font-normal text-slate-500">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                </div>
                {billingCycle === "yearly" && (
                  <p className="text-green-400 text-sm">Save {savings.superPremium}% vs monthly</p>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-pink-500">✓</span> Everything in Premium
                </li>
                <li className="flex items-center gap-2 text-slate-900 font-semibold">
                  <span className="text-pink-500">✓</span> Up to 5 tanks
                </li>
                <li className="flex items-center gap-2 text-slate-900 font-semibold">
                  <span className="text-pink-500">✓</span> 5GB photo storage
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-pink-500">✓</span> Equipment tracking
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="text-pink-500">✓</span> Livestock inventory
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

          {/* Feature Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
              Complete Feature Comparison
            </h2>
            <p className="text-center text-slate-500 mb-8">Everything you get with each plan, organized by category</p>
            
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 sticky top-0">
                    <th className="text-left py-4 px-6 font-medium text-slate-500">Feature</th>
                    <th className="text-center py-4 px-6 font-medium text-slate-500 min-w-[100px]">
                      <div className="text-2xl mb-1">🐚</div>
                      Free
                    </th>
                    <th className="text-center py-4 px-6 font-medium text-purple-500 min-w-[100px]">
                      <div className="text-2xl mb-1">👑</div>
                      Premium
                    </th>
                    <th className="text-center py-4 px-6 font-medium text-pink-500 min-w-[100px]">
                      <div className="text-2xl mb-1">🚀</div>
                      Super Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureCategories.map((category) => (
                    <>
                      {/* Category Header */}
                      <tr key={category.name} className="bg-gradient-to-r from-[var(--aqua-accent-primary)]/10 to-[var(--aqua-accent-tertiary)]/10">
                        <td colSpan={4} className="py-3 px-6 font-bold text-[var(--aqua-accent-primary)] text-sm uppercase tracking-wide">
                          {category.name}
                        </td>
                      </tr>
                      {/* Features in Category */}
                      {category.features.map((feature, index) => (
                        <tr 
                          key={feature.name} 
                          className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-slate-50/50' : ''} hover:bg-slate-100 transition`}
                        >
                          <td className="py-4 px-6">
                            <div className="font-medium text-slate-900">{feature.name}</div>
                            <div className="text-xs text-slate-500 max-w-xs">{feature.description}</div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center">
                              <FeatureValue value={feature.free} />
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center">
                              <FeatureValue value={feature.premium} />
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex justify-center">
                              <FeatureValue value={feature.superPremium} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition"
                  >
                    <span className="font-medium text-slate-900">{faq.question}</span>
                    <span className={`text-slate-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {openFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-5 pb-5 text-slate-500"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <p className="text-slate-500 text-sm mb-4">
              All plans include a 7-day money-back guarantee. Cancel anytime.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-white bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] rounded-2xl hover:shadow-cyan-500/50 transition-all duration-300 shadow-lg"
            >
              🚀 Get Started Free
            </Link>
          </motion.div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
