"use client";

import Link from "next/link";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/learn", label: "Learn" },
  { href: "mailto:support@reefxone.com", label: "Contact" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/5 bg-black/60 backdrop-blur-xl pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm">
        <div className="text-gray-400">
          <div className="font-semibold text-white">REEFXONE</div>
          <p className="text-xs text-gray-500">Track. Protect. Enjoy your reef.</p>
          <p className="text-xs text-gray-600 mt-1">© {year} ReefxOne • A CODEWERX product.</p>
          <Link
            href="https://www.code-werx.com/"
            className="text-xs text-cyan-400 hover:text-white transition-colors inline-flex items-center gap-1"
            aria-label="Codewerx website"
          >
            Visit CODEWERX
            <span aria-hidden>↗</span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 text-gray-400">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
