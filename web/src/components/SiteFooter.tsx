"use client";

import Link from "next/link";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/learn", label: "Learn" },
  { href: "mailto:support@aquaxone.com", label: "Contact" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm">
        <div className="text-slate-600">
          <div className="font-semibold text-gradient flex items-center gap-2">
            <span>🫧</span>
            AQUAXONE
          </div>
          <p className="text-xs text-slate-500 mt-1">Track. Protect. Enjoy your aquarium.</p>
          <p className="text-xs text-slate-400 mt-1">© {year} AquaXOne • A CODEWERX product.</p>
          <Link
            href="https://www.code-werx.com/"
            className="text-xs text-[var(--aqua-accent-primary)] hover:text-slate-900 transition-colors inline-flex items-center gap-1 mt-1"
            aria-label="Codewerx website"
          >
            Visit CODEWERX
            <span aria-hidden>↗</span>
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 text-slate-500">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
