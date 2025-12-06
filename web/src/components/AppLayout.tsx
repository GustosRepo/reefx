"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/utils/auth";
import { hasPremium, hasSuperPremium, hasFeature } from "@/utils/subscription";
import { useState, useEffect } from "react";
import type { User } from "@/utils/auth";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isSuperPremium, setIsSuperPremium] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsPremium(hasPremium());
      setIsSuperPremium(hasSuperPremium());
    };
    loadUser();
  }, []);

  const baseNavItems = [
    { href: "/dashboard", label: "Home", icon: "🏠" },
    { href: "/log", label: "Log", icon: "📝" },
    { href: "/history", label: "History", icon: "📜" },
    { href: "/maintenance", label: "Maintenance", icon: "🔧" },
  ];

  const superPremiumNavItems = [
    { href: "/gallery", label: "Gallery", icon: "📸", feature: "photoStorage" },
    { href: "/equipment", label: "Equipment", icon: "🛠️", feature: "equipmentTracking" },
    { href: "/livestock", label: "Livestock", icon: "🐠", feature: "livestockInventory" },
  ];

  const navItems = [
    ...baseNavItems,
    ...superPremiumNavItems.filter(item => hasFeature(item.feature as any)),
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b backdrop-blur bg-black/70 border-white/10">
        <div className="flex items-center justify-between max-w-7xl px-6 py-4 mx-auto">
          <Link href="/dashboard" className="text-2xl font-bold text-gradient">
            REEFXONE
          </Link>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-300">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition hover:text-white ${
                    pathname === item.href ? "text-cyan-400" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu - Desktop */}
            {user && (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{user.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-2">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        {isSuperPremium ? (
                          <span className="text-xs bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white px-2 py-0.5 rounded-full font-bold">🚀 SUPER</span>
                        ) : isPremium ? (
                          <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-0.5 rounded-full font-bold">👑 PRO</span>
                        ) : null}
                      </div>
                      <p className="text-sm text-white truncate">{user.email}</p>
                    </div>
                    {!isPremium && (
                      <Link
                        href="/subscription"
                        className="block px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition mx-2 my-2 rounded text-center"
                        onClick={() => setShowUserMenu(false)}
                      >
                        ✨ Upgrade to Premium
                      </Link>
                    )}
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Settings
                    </Link>
                    <Link
                      href="/subscription"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Subscription
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-4 md:px-6 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-50 w-full md:hidden border-t backdrop-blur bg-black/95 border-white/10 safe-area-bottom">
        <div className="flex justify-around items-center py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-3 px-4 transition min-w-[60px] ${
                pathname === item.href
                  ? "text-cyan-400"
                  : "text-gray-400 active:text-white"
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
