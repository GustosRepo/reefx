"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  superPremiumUsers: number;
  freeUsers: number;
  totalRevenue: number;
  activePromoCodes: number;
  totalAffiliates: number;
  pendingPayouts: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/admin/check');
      const data = await response.json();
      
      if (!data.isAdmin) {
        toast.error('Admin access required');
        router.push('/dashboard');
        return;
      }
      
      setIsAdmin(true);
      loadStats();
    } catch (err) {
      console.error('Admin check failed:', err);
      router.push('/dashboard');
    }
  };

  const loadStats = async () => {
    try {
      // Load user stats
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      const users = usersData.users || [];

      // Load promo codes
      const promoRes = await fetch('/api/admin/promo-codes');
      const promoData = await promoRes.json();
      const promoCodes = promoData.promoCodes || [];

      // Load affiliate data
      const affRes = await fetch('/api/admin/affiliates');
      const affData = await affRes.json();

      setStats({
        totalUsers: users.length,
        premiumUsers: users.filter((u: any) => u.subscription?.tier === 'premium').length,
        superPremiumUsers: users.filter((u: any) => u.subscription?.tier === 'super-premium').length,
        freeUsers: users.filter((u: any) => u.subscription?.tier === 'free' || !u.subscription).length,
        totalRevenue: affData.totals?.totalRevenue || 0,
        activePromoCodes: promoCodes.filter((p: any) => p.is_active).length,
        totalAffiliates: affData.totals?.totalPartners || 0,
        pendingPayouts: affData.totals?.pendingPayouts || 0,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (!isAdmin) {
    return (
      <div className="min-h-screen reef-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  const adminTools = [
    {
      title: "User Management",
      description: "View, search, and delete user accounts",
      icon: "👥",
      href: "/admin/users",
      color: "from-blue-500 to-cyan-500",
      stats: stats ? `${stats.totalUsers} users` : "Loading...",
    },
    {
      title: "Promo Codes",
      description: "Create and manage promotional codes",
      icon: "🎟️",
      href: "/admin/promo-codes",
      color: "from-purple-500 to-pink-500",
      stats: stats ? `${stats.activePromoCodes} active` : "Loading...",
    },
    {
      title: "Affiliates",
      description: "Track affiliate earnings and payouts",
      icon: "🤝",
      href: "/admin/affiliates",
      color: "from-green-500 to-emerald-500",
      stats: stats ? `${stats.totalAffiliates} partners` : "Loading...",
    },
    {
      title: "Feedback",
      description: "View user feedback and feature requests",
      icon: "💬",
      href: "/admin/feedback",
      color: "from-yellow-500 to-orange-500",
      stats: "View all",
    },
  ];

  return (
    <div className="min-h-screen reef-bg">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition">
              ← Back to App
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm border border-red-500/30">
              Admin Mode
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
            <p className="text-slate-500 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? "..." : stats?.totalUsers || 0}
            </p>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
            <p className="text-slate-500 text-sm">Premium</p>
            <p className="text-3xl font-bold text-[var(--aqua-accent-primary)]">
              {loading ? "..." : stats?.premiumUsers || 0}
            </p>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
            <p className="text-slate-500 text-sm">Super Premium</p>
            <p className="text-3xl font-bold text-purple-500">
              {loading ? "..." : stats?.superPremiumUsers || 0}
            </p>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
            <p className="text-slate-500 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">
              {loading ? "..." : formatCents(stats?.totalRevenue || 0)}
            </p>
          </div>
        </motion.div>

        {/* Admin Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminTools.map((tool, index) => (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link href={tool.href}>
                  <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 hover:bg-slate-50 transition group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl`}>
                        {tool.icon}
                      </div>
                      <span className="text-sm text-slate-500 group-hover:text-slate-900 transition">
                        {tool.stats}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-[var(--aqua-accent-primary)] transition">
                      {tool.title}
                    </h3>
                    <p className="text-slate-500 text-sm">{tool.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/promo-codes">
                <button className="w-full py-3 px-4 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition text-sm font-medium">
                  + Create Promo Code
                </button>
              </Link>
              <Link href="/admin/users">
                <button className="w-full py-3 px-4 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition text-sm font-medium">
                  Search Users
                </button>
              </Link>
              <Link href="/admin/affiliates">
                <button className="w-full py-3 px-4 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition text-sm font-medium">
                  View Payouts
                </button>
              </Link>
              <button 
                onClick={() => {
                  loadStats();
                  toast.success('Stats refreshed');
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-sm font-medium"
              >
                🔄 Refresh Stats
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pending Payouts Alert */}
        {stats && stats.pendingPayouts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="bg-yellow-50 border border-yellow-300 shadow-sm rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl">
                    💰
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Pending Affiliate Payouts</h3>
                    <p className="text-yellow-600">{formatCents(stats.pendingPayouts)} awaiting payment</p>
                  </div>
                </div>
                <Link href="/admin/affiliates">
                  <button className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition">
                    Process Payouts
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
