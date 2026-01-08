"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

interface PromoCode {
  id: string;
  code: string;
  partner_name: string;
  partner_email: string | null;
  discount_type: string;
  discount_value: number;
  applies_to: string;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminPromoClient() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // New code form
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [trialDays, setTrialDays] = useState(30);
  const [appliesTo, setAppliesTo] = useState<"premium" | "super-premium" | "both">("premium");
  const [maxUses, setMaxUses] = useState<number | "">("");
  const [expiresIn, setExpiresIn] = useState<number | "">(""); // days

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const response = await fetch('/api/admin/promo-codes');
      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes || []);
      } else if (response.status === 403) {
        toast.error('Admin access required');
      }
    } catch (err) {
      console.error('Failed to load codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    if (partnerName) {
      const base = partnerName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      setCustomCode(`${base}${suffix}`);
    } else {
      setCustomCode(`REEF${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    }
  };

  const createCode = async () => {
    if (!partnerName.trim()) {
      toast.error('Partner name is required');
      return;
    }
    if (!customCode.trim()) {
      toast.error('Code is required');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: customCode.toUpperCase().trim(),
          partnerName: partnerName.trim(),
          partnerEmail: partnerEmail.trim() || null,
          discountType: 'free_trial',
          discountValue: trialDays,
          appliesTo,
          maxUses: maxUses || null,
          expiresInDays: expiresIn || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Promo code created!');
        setCodes([data.code, ...codes]);
        setPartnerName("");
        setPartnerEmail("");
        setCustomCode("");
        setTrialDays(30);
        setMaxUses("");
        setExpiresIn("");
      } else {
        toast.error(data.error || 'Failed to create code');
      }
    } catch (err) {
      toast.error('Failed to create code');
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });

      if (response.ok) {
        setCodes(codes.map(c => c.id === id ? { ...c, is_active: !currentActive } : c));
        toast.success(currentActive ? 'Code deactivated' : 'Code activated');
      }
    } catch (err) {
      toast.error('Failed to update code');
    }
  };

  const deleteCode = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    
    try {
      const response = await fetch(`/api/admin/promo-codes?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCodes(codes.filter(c => c.id !== id));
        toast.success('Code deleted');
      }
    } catch (err) {
      toast.error('Failed to delete code');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Link 
              href="/admin" 
              className="text-gray-400 hover:text-white transition"
            >
              ← Admin Dashboard
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <span>🎟️</span> Partner Promo Codes
              </h1>
              <p className="text-gray-400">Create codes for stores, YouTubers, and partners</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm border border-red-500/30">
              Admin Mode
            </span>
          </div>
        </motion.div>

        {/* Create New Code */}
        <motion.div 
          className="glass-card rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Create New Code</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Partner Name *</label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g., Bulk Reef Supply"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Partner Email (optional)</label>
              <input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="BRS2025"
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none font-mono"
                />
                <button
                  onClick={generateCode}
                  className="px-3 py-2 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition text-sm"
                  title="Generate code"
                >
                  🎲
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Free Trial Days</label>
              <input
                type="number"
                value={trialDays}
                onChange={(e) => setTrialDays(parseInt(e.target.value) || 30)}
                min={1}
                max={365}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Applies To</label>
              <select
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value as typeof appliesTo)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500/50 focus:outline-none"
              >
                <option value="premium">Premium only</option>
                <option value="super-premium">Super Premium only</option>
                <option value="both">Both tiers</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max Uses (leave empty for unlimited)</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : "")}
                min={1}
                placeholder="Unlimited"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Expires In Days (leave empty for never)</label>
              <input
                type="number"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : "")}
                min={1}
                placeholder="Never"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={createCode}
            disabled={creating || !partnerName.trim() || !customCode.trim()}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : '🎟️ Create Promo Code'}
          </button>
        </motion.div>

        {/* Existing Codes */}
        <motion.div 
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Existing Codes</h2>
          
          {loading ? (
            <p className="text-gray-400 text-center py-8">Loading...</p>
          ) : codes.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No promo codes yet. Create your first one above!</p>
          ) : (
            <div className="space-y-3">
              {codes.map((code) => (
                <div 
                  key={code.id}
                  className={`p-4 rounded-xl border ${code.is_active ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/20'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => copyCode(code.code)}
                          className="font-mono text-lg font-bold text-cyan-400 hover:text-cyan-300 transition"
                          title="Click to copy"
                        >
                          {code.code}
                        </button>
                        {!code.is_active && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        <span className="text-white">{code.partner_name}</span>
                        {' • '}
                        {code.discount_value} days free {code.applies_to === 'both' ? 'Premium/Super' : code.applies_to}
                        {' • '}
                        {code.uses_count}{code.max_uses ? `/${code.max_uses}` : ''} uses
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(code.id, code.is_active)}
                        className={`px-3 py-1 text-xs rounded-lg transition ${
                          code.is_active 
                            ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' 
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {code.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteCode(code.id)}
                        className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
