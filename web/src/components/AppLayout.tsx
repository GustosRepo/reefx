"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/utils/auth";
import { useSubscription } from "@/context/SubscriptionContext";
import { useTank } from "@/context/TankContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@/utils/auth";
import SiteFooter from "@/components/SiteFooter";
import FeedbackModal from "@/components/FeedbackModal";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTankMenu, setShowTankMenu] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { tanks, currentTank, setCurrentTank } = useTank();
  const { subscription } = useSubscription();
  const userTier = subscription.tier;

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Check if user is admin
      if (currentUser) {
        try {
          const res = await fetch('/api/admin/check');
          if (res.ok) {
            const data = await res.json();
            setIsAdmin(data.isAdmin);
          }
        } catch {
          // Silently fail
        }
      }
    };
    loadUser();
  }, []);

  const handleTankChange = (tank: typeof currentTank) => {
    if (tank) {
      setCurrentTank(tank);
      setShowTankMenu(false);
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Home", icon: "🏠" },
    { href: "/log", label: "Log", icon: "📝" },
    { href: "/history", label: "History", icon: "📜" },
    { href: "/maintenance", label: "Maint.", icon: "🔧" },
    { href: "/gallery", label: "Gallery", icon: "📸", requiresTier: 'premium' as const },
    { href: "/equipment", label: "Equip.", icon: "🛠️", requiresTier: 'super-premium' as const },
    { href: "/livestock", label: "Stock", icon: "🐠", requiresTier: 'super-premium' as const },
    { href: "/learn", label: "Guides", icon: "📚" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  const adminNavItems = [
    { href: "/admin/promo-codes", label: "Promos", icon: "🎟️" },
    { href: "/admin/affiliates", label: "Affiliates", icon: "🤝" },
  ];

  const hasAccess = (requiredTier?: 'premium' | 'super-premium') => {
    if (!requiredTier) return true;
    if (requiredTier === 'premium') return userTier === 'premium' || userTier === 'super-premium';
    if (requiredTier === 'super-premium') return userTier === 'super-premium';
    return false;
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen reef-bg text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b backdrop-blur-xl bg-black/60 border-white/5">
        <div className="flex items-center justify-between max-w-7xl px-4 md:px-6 py-3 mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl md:text-2xl font-bold text-gradient">
              REEFXONE
            </Link>
            
            {/* Tank Selector */}
            {tanks.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowTankMenu(!showTankMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-cyan-500/30 transition"
                >
                  <span className="text-cyan-400">🐠</span>
                  <span className="hidden sm:inline max-w-[100px] truncate">{currentTank?.name || 'Select Tank'}</span>
                  <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showTankMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50"
                    >
                      <div className="px-3 py-2 border-b border-gray-700">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Your Tanks</p>
                      </div>
                      {tanks.map((tank) => (
                        <button
                          key={tank.id}
                          onClick={() => handleTankChange(tank)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition flex items-center gap-3 ${
                            currentTank?.id === tank.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300'
                          }`}
                        >
                          <span className="text-lg">🐠</span>
                          <div>
                            <p className="font-medium">{tank.name}</p>
                            <p className="text-xs text-gray-500">{tank.volume} gal • {tank.type}</p>
                          </div>
                          {currentTank?.id === tank.id && (
                            <span className="ml-auto text-cyan-400">✓</span>
                          )}
                        </button>
                      ))}
                      <div className="border-t border-gray-700 mt-2 pt-2 px-3">
                        <Link
                          href="/settings#tanks"
                          className="block text-xs text-cyan-400 hover:text-cyan-300 transition py-1"
                          onClick={() => setShowTankMenu(false)}
                        >
                          ⚙️ Manage Tanks
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <nav className="hidden lg:flex space-x-1 text-sm font-medium">
              {navItems.map((item) => {
                const locked = item.requiresTier && !hasAccess(item.requiresTier);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      if (locked) {
                        e.preventDefault();
                        router.push('/subscription');
                      }
                    }}
                    className={`px-3 py-2 rounded-lg transition ${
                      pathname === item.href 
                        ? "bg-cyan-500/20 text-cyan-400" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    } ${locked ? "opacity-50" : ""}`}
                  >
                    {item.label} {locked && "🔒"}
                  </Link>
                );
              })}
              {/* Admin nav items */}
              {isAdmin && adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg transition ${
                    pathname === item.href 
                      ? "bg-amber-500/20 text-amber-400" 
                      : "text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10"
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu - Desktop */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-semibold text-white shadow-lg shadow-cyan-500/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden xl:inline">{user.name}</span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-xl py-2"
                    >
                      <div className="px-4 py-2 border-b border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          {userTier === 'super-premium' ? (
                            <span className="text-xs bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white px-2 py-0.5 rounded-full font-bold shimmer">🚀 SUPER</span>
                          ) : userTier === 'premium' ? (
                            <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-bold shimmer">👑 PRO</span>
                          ) : null}
                        </div>
                        <p className="text-sm text-white truncate">{user.email}</p>
                      </div>
                      {userTier === 'free' && (
                        <Link
                          href="/subscription"
                          className="block px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition mx-2 my-2 rounded-lg text-center shimmer"
                          onClick={() => setShowUserMenu(false)}
                        >
                          ✨ Upgrade to Premium
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition rounded-lg mx-1"
                        onClick={() => setShowUserMenu(false)}
                      >
                        ⚙️ Settings
                      </Link>
                      <Link
                        href="/subscription"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition rounded-lg mx-1"
                        onClick={() => setShowUserMenu(false)}
                      >
                        💎 Subscription
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowFeedbackModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition rounded-lg mx-1"
                      >
                        💬 Send Feedback
                      </button>
                      <div className="border-t border-white/10 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition rounded-lg mx-1"
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-24 px-4 md:px-6 max-w-7xl mx-auto min-h-screen">
        {children}
      </main>

      <SiteFooter />

      {/* Floating Feedback Button - Desktop (only for logged-in users) */}
      {user && (
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="hidden lg:flex fixed bottom-6 right-6 z-40 items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all"
        >
          <span>💬</span>
          <span>Feedback</span>
        </button>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-50 w-full lg:hidden border-t backdrop-blur-xl bg-black/80 border-white/5 safe-area-bottom">
        <div className="flex justify-around items-center py-2">
          {navItems.slice(0, 5).map((item) => {
            const locked = item.requiresTier && !hasAccess(item.requiresTier);
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={locked ? "/subscription" : item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition min-w-[56px] ${
                  isActive
                    ? "text-cyan-400 bg-cyan-500/10"
                    : "text-gray-500 active:text-white active:bg-white/5"
                } ${locked ? "opacity-50" : ""}`}
              >
                <span className={`text-xl mb-0.5 ${isActive ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/settings"
            className={`flex flex-col items-center py-2 px-3 rounded-xl transition min-w-[56px] ${
              pathname === "/settings"
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-gray-500 active:text-white active:bg-white/5"
            }`}
          >
            <span className={`text-xl mb-0.5 ${pathname === "/settings" ? 'scale-110' : ''} transition-transform`}>⚙️</span>
            <span className="text-[10px] font-medium">Settings</span>
          </Link>
          {/* Admin items on mobile */}
          {isAdmin && adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition min-w-[56px] ${
                  isActive
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-amber-400/60 active:text-amber-400 active:bg-amber-500/5"
                }`}
              >
                <span className={`text-xl mb-0.5 ${isActive ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
