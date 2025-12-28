"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const articles = [
  {
    slug: "beginners-guide-reef-keeping",
    title: "Beginner's Guide to Reef Keeping",
    description: "Everything you need to know to start your first saltwater reef aquarium. From tank selection to your first coral.",
    icon: "🐠",
    readTime: "8 min read",
    category: "Getting Started",
  },
  {
    slug: "understanding-water-parameters",
    title: "Understanding Water Parameters",
    description: "Learn why water chemistry matters and how each parameter affects your reef's health.",
    icon: "🧪",
    readTime: "10 min read",
    category: "Water Chemistry",
  },
  {
    slug: "ideal-alkalinity-levels",
    title: "Maintaining Ideal Alkalinity Levels",
    description: "A deep dive into alkalinity - why it's crucial for coral growth and how to keep it stable.",
    icon: "⚗️",
    readTime: "6 min read",
    category: "Water Chemistry",
  },
  {
    slug: "temperature-salinity-guide",
    title: "Temperature & Salinity: The Basics",
    description: "Master the fundamentals of maintaining proper temperature and salinity in your reef tank.",
    icon: "🌡️",
    readTime: "5 min read",
    category: "Water Chemistry",
  },
  {
    slug: "common-reef-keeping-mistakes",
    title: "10 Common Reef Keeping Mistakes",
    description: "Avoid these pitfalls that trip up beginners and even experienced reefers.",
    icon: "⚠️",
    readTime: "7 min read",
    category: "Tips & Tricks",
  },
  {
    slug: "essential-reef-equipment",
    title: "Essential Reef Tank Equipment",
    description: "A complete guide to the equipment you need for a successful reef aquarium.",
    icon: "🔧",
    readTime: "9 min read",
    category: "Equipment",
  },
  {
    slug: "coral-care-basics",
    title: "Coral Care Basics for Beginners",
    description: "Learn how to select, place, and care for your first corals with confidence.",
    icon: "🪸",
    readTime: "8 min read",
    category: "Coral Care",
  },
  {
    slug: "testing-water-best-practices",
    title: "Water Testing Best Practices",
    description: "How often to test, which test kits to use, and how to interpret your results.",
    icon: "📊",
    readTime: "6 min read",
    category: "Water Chemistry",
  },
];

const categories = ["All", "Getting Started", "Water Chemistry", "Equipment", "Coral Care", "Tips & Tricks"];

export default function LearnPage() {
  return (
    <div className="min-h-screen reef-bg">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gradient">
            REEFXONE
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/learn" className="text-cyan-400 font-medium">
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

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gradient gradient-animate mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Reef Keeping Guides
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Expert tips and comprehensive guides to help you build and maintain a thriving reef aquarium.
          </motion.p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/learn/${article.slug}`}>
                  <div className="glass-card rounded-2xl p-6 h-full hover:border-cyan-500/50 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{article.icon}</span>
                      <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition">
                      {article.title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{article.readTime}</span>
                      <span className="text-cyan-400 text-sm group-hover:translate-x-1 transition-transform">
                        Read more →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Track Your Reef?
            </h2>
            <p className="text-gray-400 mb-6">
              Join thousands of reef keepers using REEFXONE to monitor water parameters, track livestock, and maintain a healthy aquarium.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register"
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition"
              >
                Start Free Today
              </Link>
              <Link 
                href="/login"
                className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

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
            <Link href="/privacy" className="text-gray-400 hover:text-white transition">
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
