"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  subscription: {
    tier: string;
    status: string;
  };
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}

function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (response.status === 401 || response.redirected) {
          toast.error('Please log in to access this page');
        } else {
          toast.error('Server error - please try again');
        }
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else if (response.status === 403) {
        toast.error('Admin access required');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to load users');
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setConfirmEmail("");
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    if (confirmEmail !== userToDelete.email) {
      toast.error('Email does not match');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToDelete.id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'User deleted successfully');
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setShowDeleteModal(false);
        setUserToDelete(null);
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'super-premium':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'premium':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href="/admin" 
                className="text-gray-400 hover:text-white transition"
              >
                ← Admin Dashboard
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <span>👥</span> User Management
            </h1>
            <p className="text-gray-400 mt-1">
              Manage and delete user accounts
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm border border-red-500/30">
            Admin Mode
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white">{users.length}</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-gray-400 text-sm">Premium</p>
            <p className="text-2xl font-bold text-cyan-400">
              {users.filter(u => u.subscription.tier === 'premium').length}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-gray-400 text-sm">Super Premium</p>
            <p className="text-2xl font-bold text-purple-400">
              {users.filter(u => u.subscription.tier === 'super-premium').length}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-gray-400 text-sm">Free</p>
            <p className="text-2xl font-bold text-gray-400">
              {users.filter(u => u.subscription.tier === 'free').length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          />
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-gray-400">
              {searchTerm ? 'No users match your search' : 'No users found'}
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium">User</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Joined</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium flex items-center gap-2">
                            {user.name}
                            {user.is_admin && (
                              <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                                Admin
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getTierBadge(user.subscription.tier)}`}>
                          {user.subscription.tier}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="p-4 text-right">
                        {user.is_admin ? (
                          <span className="text-gray-600 text-sm">Protected</span>
                        ) : (
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && userToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => !deleting && setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card rounded-2xl p-6 w-full max-w-md"
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">⚠️</div>
                  <h2 className="text-xl font-bold text-white mb-2">Delete User Account</h2>
                  <p className="text-gray-400 text-sm">
                    This action <span className="text-red-400 font-semibold">cannot be undone</span>. 
                    All user data including logs, maintenance records, livestock, and photos will be permanently deleted.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <p className="text-white font-medium">{userToDelete.name}</p>
                  <p className="text-gray-400 text-sm">{userToDelete.email}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">
                    Type <span className="text-red-400 font-mono">{userToDelete.email}</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Enter email to confirm"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                    disabled={deleting}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 font-medium hover:bg-white/10 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting || confirmEmail !== userToDelete.email}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete User'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
