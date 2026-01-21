"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ReefForm } from "@/types";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdBanner from "@/components/AdBanner";
import { useTank } from "@/context/TankContext";
import { useAquaMode, useModeParameters } from "@/context/AquaModeContext";

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryPageContent />
    </ProtectedRoute>
  );
}

function HistoryPageContent() {
  const [logs, setLogs] = useState<ReefForm[]>([]);
  const [editingLog, setEditingLog] = useState<ReefForm | null>(null);
  const [editForm, setEditForm] = useState<ReefForm | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const { currentTank } = useTank();
  const { mode } = useAquaMode();
  const modeParameters = useModeParameters();

  useEffect(() => {
    if (currentTank) {
      loadLogs(currentTank.id);
    }
  }, [currentTank?.id]);

  const loadLogs = async (tankId: string) => {
    try {
      const response = await fetch(`/api/logs?tank_id=${tankId}`);
      const data: ReefForm[] = await response.json();
      const sorted = data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setLogs(sorted);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const handleDeleteClick = (logId: string) => {
    setDeleteLogId(logId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteLogId) return;

    try {
      const response = await fetch(`/api/logs/${deleteLogId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete log');
      }
      
      if (currentTank) await loadLogs(currentTank.id);
      toast.success('Log deleted successfully!');
    } catch (err) {
      console.error("Failed to delete log:", err);
      toast.error("Failed to delete log");
    } finally {
      setShowDeleteModal(false);
      setDeleteLogId(null);
    }
  };

  const startEdit = (log: ReefForm) => {
    setEditingLog(log);
    setEditForm({ ...log });
  };

  const cancelEdit = () => {
    setEditingLog(null);
    setEditForm(null);
  };

  const saveEdit = async () => {
    if (!editForm || !editingLog) return;

    try {
      const response = await fetch(`/api/logs/${(editingLog as any).id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update log');
      }
      
      if (currentTank) await loadLogs(currentTank.id);
      cancelEdit();
      toast.success("Log updated successfully!");
    } catch (err) {
      console.error("Failed to update log:", err);
      toast.error("Failed to update log");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gradient mb-6">History</h1>

        <AdBanner />

        {logs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
            <p className="text-slate-500">No logs found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.date}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-[var(--aqua-accent-primary)]/50 transition-all duration-300 hover:shadow-lg shadow-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--aqua-accent-primary)]">{log.date}</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => startEdit(log)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick((log as any).id)}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {modeParameters.map(({ key, label, icon }) => (
                    <div key={key} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500 text-xs md:text-sm flex items-center gap-1">
                        <span>{icon}</span> {label.split(' (')[0]}
                      </p>
                      <p className="text-slate-900 font-semibold text-sm md:text-base">
                        {log[key as keyof ReefForm] || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
            <div className="bg-white border border-red-200 rounded-xl p-6 max-w-md w-full shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🗑️</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Log?</h3>
                <p className="text-slate-500">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingLog && editForm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h2 className="text-2xl font-bold text-[var(--aqua-accent-primary)] mb-4">
                Edit Log - {editingLog.date}
              </h2>

              <div className="space-y-4">
                {[
                  { key: "temp", label: "Temperature (°C)" },
                  { key: "salinity", label: "Salinity (ppt)" },
                  { key: "alk", label: "Alkalinity (dKH)" },
                  { key: "ph", label: "pH" },
                  { key: "cal", label: "Calcium (ppm)" },
                  { key: "mag", label: "Magnesium (ppm)" },
                  { key: "po4", label: "Phosphate (PO₄)" },
                  { key: "no3", label: "Nitrate (NO₃)" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-[var(--aqua-accent-primary)] mb-2">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={editForm[key as keyof ReefForm]}
                      onChange={(e) =>
                        setEditForm({ ...editForm, [key]: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:border-[var(--aqua-accent-primary)] focus:ring-2 focus:ring-[var(--aqua-accent-primary)]/20"
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={saveEdit}
                  className="flex-1 py-3 bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
