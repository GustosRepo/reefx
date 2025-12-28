"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

interface PartnerSummary {
  id: string;
  code: string;
  partner_name: string;
  partner_email: string | null;
  uses_count: number;
  is_active: boolean;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  payingCustomers: number;
  conversionRate: string;
}

interface Totals {
  totalPartners: number;
  totalRedemptions: number;
  totalRevenue: number;
  totalCommission: number;
  pendingPayouts: number;
}

export default function AdminAffiliatesPage() {
  return (
    <ProtectedRoute>
      <AdminAffiliatesContent />
    </ProtectedRoute>
  );
}

function AdminAffiliatesContent() {
  const [partners, setPartners] = useState<PartnerSummary[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerSummary | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/admin/affiliates');
      
      // Check content type to avoid parsing HTML as JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response');
        if (response.status === 401 || response.redirected) {
          toast.error('Please log in to access this page');
        } else {
          toast.error('Server error - please try again');
        }
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setPartners(data.partners || []);
        setTotals(data.totals || null);
      } else if (response.status === 403) {
        toast.error('Admin access required');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to load data');
      }
    } catch (err) {
      console.error('Failed to load affiliate data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatCents = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const openPayoutModal = (partner: PartnerSummary) => {
    setSelectedPartner(partner);
    setPaymentMethod("paypal");
    setPaymentReference("");
    setNotes("");
    setShowPayoutModal(true);
  };

  const processPayout = async () => {
    if (!selectedPartner) return;
    
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedPartner.id,
          paymentMethod,
          paymentReference,
          notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Paid out ${formatCents(data.paidAmount)} to ${selectedPartner.partner_name}`);
        setShowPayoutModal(false);
        loadData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to process payout');
      }
    } catch (err) {
      console.error('Error processing payout:', err);
      toast.error('Failed to process payout');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-24 pt-6 px-4">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">💰 Partner Affiliates</h1>
            <Link
              href="/admin/promo-codes"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition"
            >
              ← Manage Promo Codes
            </Link>
          </div>
          <p className="text-gray-400">Track partner earnings and process payouts (5% commission)</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Totals Cards */}
            {totals && (
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{totals.totalPartners}</p>
                  <p className="text-xs text-gray-400">Partners</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{totals.totalRedemptions}</p>
                  <p className="text-xs text-gray-400">Total Signups</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{formatCents(totals.totalRevenue)}</p>
                  <p className="text-xs text-gray-400">Revenue from Partners</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">{formatCents(totals.totalCommission)}</p>
                  <p className="text-xs text-gray-400">Total Commission</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center border border-yellow-500/30">
                  <p className="text-2xl font-bold text-yellow-400">{formatCents(totals.pendingPayouts)}</p>
                  <p className="text-xs text-gray-400">Pending Payouts</p>
                </div>
              </motion.div>
            )}

            {/* Partners Table */}
            {partners.length === 0 ? (
              <motion.div 
                className="glass-card rounded-xl p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-6xl mb-4">📊</p>
                <p className="text-xl text-white mb-2">No affiliate data yet</p>
                <p className="text-gray-400">Partner earnings will appear here when customers pay using promo codes</p>
              </motion.div>
            ) : (
              <motion.div 
                className="glass-card rounded-xl overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Partner</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Code</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Signups</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Paying</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Conv %</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Revenue</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Earned</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Pending</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {partners.map((partner) => (
                        <tr key={partner.id} className="hover:bg-white/5 transition">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-white">{partner.partner_name}</p>
                              <p className="text-xs text-gray-500">{partner.partner_email || 'No email'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-mono text-cyan-400">{partner.code}</span>
                          </td>
                          <td className="px-4 py-4 text-center text-white">{partner.uses_count}</td>
                          <td className="px-4 py-4 text-center text-white">{partner.payingCustomers}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={partner.payingCustomers > 0 ? 'text-green-400' : 'text-gray-500'}>
                              {partner.conversionRate}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-white">{formatCents(partner.totalRevenue)}</td>
                          <td className="px-4 py-4 text-right text-purple-400">{formatCents(partner.totalCommission)}</td>
                          <td className="px-4 py-4 text-right">
                            <span className={partner.pendingCommission > 0 ? 'text-yellow-400 font-semibold' : 'text-gray-500'}>
                              {formatCents(partner.pendingCommission)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {partner.pendingCommission > 0 ? (
                              <button
                                onClick={() => openPayoutModal(partner)}
                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition"
                              >
                                Pay Out
                              </button>
                            ) : (
                              <span className="text-gray-500 text-sm">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* How It Works */}
            <motion.div 
              className="mt-8 glass-card rounded-xl p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">📝 How Affiliate Tracking Works</h3>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-3xl mb-2">1️⃣</div>
                  <p className="text-gray-400">Partner shares their promo code (e.g., <span className="text-cyan-400">BRS2025</span>)</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">2️⃣</div>
                  <p className="text-gray-400">Customer signs up with code → gets free trial</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">3️⃣</div>
                  <p className="text-gray-400">Customer upgrades to paid → 5% tracked here</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">4️⃣</div>
                  <p className="text-gray-400">You pay partners monthly via PayPal/Venmo</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Payout Modal */}
      <AnimatePresence>
        {showPayoutModal && selectedPartner && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPayoutModal(false)}
          >
            <motion.div
              className="glass-card rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">💸 Process Payout</h2>
              
              <div className="mb-6 p-4 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-sm">Paying out to</p>
                <p className="text-lg font-semibold text-white">{selectedPartner.partner_name}</p>
                <p className="text-2xl font-bold text-green-400 mt-2">
                  {formatCents(selectedPartner.pendingCommission)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:outline-none"
                  >
                    <option value="paypal">PayPal</option>
                    <option value="venmo">Venmo</option>
                    <option value="zelle">Zelle</option>
                    <option value="check">Check</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Reference / Transaction ID</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g., PayPal transaction ID"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes about this payout"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayout}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Confirm Payout'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
