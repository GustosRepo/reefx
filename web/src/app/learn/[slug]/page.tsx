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
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Article Not Found</h1>
          <Link href="/learn" className="text-[var(--aqua-accent-primary)] hover:opacity-80">
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
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gradient">
            AQUAXONE
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/learn" className="text-cyan-400 font-medium">
              Learn
            </Link>
            <Link href="/login" className="text-slate-500 hover:text-slate-900 transition">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] rounded-lg font-medium text-white hover:opacity-90 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <nav className="text-sm text-slate-500">
          <Link href="/learn" className="hover:text-slate-900 transition">Guides</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-600">{article.category}</span>
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
            <span className="text-sm text-[var(--aqua-accent-primary)] bg-[var(--aqua-accent-primary)]/10 px-3 py-1 rounded-full">
              {article.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {article.title}
          </h1>
          <p className="text-xl text-slate-600 mb-4">
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
        <div className="prose prose-lg max-w-none
          prose-headings:text-slate-900 prose-headings:font-bold
          prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-[var(--aqua-accent-primary)]
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-slate-600 prose-p:leading-relaxed
          prose-a:text-[var(--aqua-accent-primary)] prose-a:no-underline hover:prose-a:opacity-80
          prose-strong:text-slate-900
          prose-ul:text-slate-600
          prose-ol:text-slate-600
          prose-li:marker:text-[var(--aqua-accent-primary)]
          prose-table:border-collapse
          prose-th:bg-slate-100 prose-th:border prose-th:border-slate-200 prose-th:p-3 prose-th:text-left
          prose-td:border prose-td:border-slate-200 prose-td:p-3
          prose-code:text-[var(--aqua-accent-primary)] prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded
          prose-blockquote:border-l-[var(--aqua-accent-primary)] prose-blockquote:bg-slate-50 prose-blockquote:py-1
        ">
          <ReactMarkdown>
            {article.content}
          </ReactMarkdown>
        </div>

        {/* CTA Box */}
        <div className="mt-12 bg-white border border-slate-200 shadow-sm rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Start Tracking Your Reef Today
          </h2>
          <p className="text-slate-600 mb-6">
            Join thousands of reef keepers using AQUAXONE to monitor parameters, track livestock, and grow thriving reefs.
          </p>
          <Link 
            href="/register"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white rounded-xl font-semibold hover:opacity-90 transition"
          >
            Create Free Account
          </Link>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Related Guides</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedArticles.map((related) => (
                <Link key={related.slug} href={`/learn/${related.slug}`}>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-[var(--aqua-accent-primary)]/50 transition group">
                    <span className="text-2xl mb-2 block">{related.icon}</span>
                    <h4 className="font-semibold text-slate-900 group-hover:text-[var(--aqua-accent-primary)] transition text-sm">
                      {related.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{related.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/learn" className="text-[var(--aqua-accent-primary)] hover:opacity-80 transition">
            ← Back to All Guides
          </Link>
        </div>
      </motion.article>

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
            <Link href="/terms" className="text-slate-500 hover:text-slate-900 transition">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
