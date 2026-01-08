"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Feedback {
  id: string;
  user_id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user: {
    email: string;
    name: string;
  };
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "in-review": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  planned: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  declined: "bg-red-500/20 text-red-400 border-red-500/30",
};

const typeIcons: Record<string, string> = {
  bug: "🐛",
  feature: "✨",
  improvement: "💡",
  other: "📝",
};

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const checkRes = await fetch('/api/admin/check');
      const checkData = await checkRes.json();
      
      if (!checkData.isAdmin) {
        toast.error('Admin access required');
        router.push('/dashboard');
        return;
      }

      loadFeedback();
    } catch (err) {
      router.push('/dashboard');
    }
  };

  const loadFeedback = async () => {
    try {
      const response = await fetch('/api/admin/feedback');
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
      }
    } catch (err) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        toast.success('Status updated');
        setFeedback(feedback.map(f => f.id === id ? { ...f, status } : f));
        if (selectedFeedback?.id === id) {
          setSelectedFeedback({ ...selectedFeedback, status });
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedFeedback) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedFeedback.id, admin_notes: adminNotes }),
      });

      if (response.ok) {
        toast.success('Notes saved');
        setFeedback(feedback.map(f => 
          f.id === selectedFeedback.id ? { ...f, admin_notes: adminNotes } : f
        ));
        setSelectedFeedback({ ...selectedFeedback, admin_notes: adminNotes });
      }
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  const filteredFeedback = filter === "all" 
    ? feedback 
    : feedback.filter(f => f.status === filter);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen reef-bg">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white transition">
              ← Admin Dashboard
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">💬</span>
              User Feedback
            </h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm border border-red-500/30">
            Admin Mode
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "new", "in-review", "planned", "completed", "declined"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status 
                  ? "bg-cyan-500 text-white" 
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== "all" && (
                <span className="ml-2 opacity-60">
                  ({feedback.filter(f => f.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{feedback.length}</p>
            <p className="text-gray-400 text-sm">Total</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">
              {feedback.filter(f => f.status === 'new').length}
            </p>
            <p className="text-gray-400 text-sm">New</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {feedback.filter(f => f.status === 'in-review').length}
            </p>
            <p className="text-gray-400 text-sm">In Review</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {feedback.filter(f => f.status === 'planned').length}
            </p>
            <p className="text-gray-400 text-sm">Planned</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {feedback.filter(f => f.status === 'completed').length}
            </p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-gray-400">No feedback found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-4 hover:bg-white/5 transition cursor-pointer"
                onClick={() => {
                  setSelectedFeedback(item);
                  setAdminNotes(item.admin_notes || "");
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{typeIcons[item.type] || "📝"}</div>
                    <div>
                      <h3 className="font-medium text-white">{item.subject}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{item.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">{item.user.email}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedFeedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedFeedback(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{typeIcons[selectedFeedback.type] || "📝"}</div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedFeedback.subject}</h2>
                      <p className="text-gray-400 text-sm capitalize">{selectedFeedback.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-400 hover:text-white transition text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* User Info */}
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <p className="text-white">{selectedFeedback.user.name}</p>
                  <p className="text-gray-400 text-sm">{selectedFeedback.user.email}</p>
                  <p className="text-gray-500 text-xs mt-1">{formatDate(selectedFeedback.created_at)}</p>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Message</h3>
                  <p className="text-white whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["new", "in-review", "planned", "completed", "declined"].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(selectedFeedback.id, status)}
                        disabled={updating}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                          selectedFeedback.status === status
                            ? statusColors[status]
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Admin Notes</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this feedback..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
                  />
                  <button
                    onClick={saveNotes}
                    disabled={updating || adminNotes === (selectedFeedback.admin_notes || "")}
                    className="mt-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
