"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getArticle, getAllArticles } from "../articles";
import ReactMarkdown from "react-markdown";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = getArticle(slug);

  if (!article) {
    return (
      <div className="min-h-screen reef-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
          <Link href="/learn" className="text-cyan-400 hover:text-cyan-300">
            ← Back to Guides
          </Link>
        </div>
      </div>
    );
  }

  // Get related articles (same category, excluding current)
  const relatedArticles = getAllArticles()
    .filter(a => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

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

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <nav className="text-sm text-gray-500">
          <Link href="/learn" className="hover:text-white transition">Guides</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-400">{article.category}</span>
        </nav>
      </div>

      {/* Article Header */}
      <motion.article 
        className="max-w-4xl mx-auto px-4 pb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{article.icon}</span>
            <span className="text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
              {article.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {article.title}
          </h1>
          <p className="text-xl text-gray-400 mb-4">
            {article.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{article.author}</span>
            <span>•</span>
            <span>{article.readTime}</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-invert prose-lg max-w-none
          prose-headings:text-white prose-headings:font-bold
          prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-cyan-400
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:text-cyan-300
          prose-strong:text-white
          prose-ul:text-gray-300
          prose-ol:text-gray-300
          prose-li:marker:text-cyan-400
          prose-table:border-collapse
          prose-th:bg-white/10 prose-th:border prose-th:border-white/20 prose-th:p-3 prose-th:text-left
          prose-td:border prose-td:border-white/20 prose-td:p-3
          prose-code:text-cyan-400 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded
          prose-blockquote:border-l-cyan-500 prose-blockquote:bg-white/5 prose-blockquote:py-1
        ">
          <ReactMarkdown>
            {article.content}
          </ReactMarkdown>
        </div>

        {/* CTA Box */}
        <div className="mt-12 glass-card rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Start Tracking Your Reef Today
          </h2>
          <p className="text-gray-400 mb-6">
            Join thousands of reef keepers using REEFXONE to monitor parameters, track livestock, and grow thriving reefs.
          </p>
          <Link 
            href="/register"
            className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition"
          >
            Create Free Account
          </Link>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-white mb-6">Related Guides</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedArticles.map((related) => (
                <Link key={related.slug} href={`/learn/${related.slug}`}>
                  <div className="glass-card rounded-xl p-4 hover:border-cyan-500/50 transition group">
                    <span className="text-2xl mb-2 block">{related.icon}</span>
                    <h4 className="font-semibold text-white group-hover:text-cyan-400 transition text-sm">
                      {related.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{related.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/learn" className="text-cyan-400 hover:text-cyan-300 transition">
            ← Back to All Guides
          </Link>
        </div>
      </motion.article>

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
