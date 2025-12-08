"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { MaintenanceEntry } from "@/types";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdBanner from "@/components/AdBanner";

export default function MaintenancePage() {
  return (
    <ProtectedRoute>
      <MaintenancePageContent />
    </ProtectedRoute>
  );
}

function MaintenancePageContent() {
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [repeatInterval, setRepeatInterval] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [userTankId, setUserTankId] = useState<string | null>(null);

  useEffect(() => {
    refreshEntries();
    loadUserTank();
  }, []);

  const loadUserTank = async () => {
    try {
      const response = await fetch('/api/tanks');
      const data = await response.json();
      if (data && data.length > 0) {
        setUserTankId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load tank:', err);
    }
  };

  const refreshEntries = async () => {
    try {
      const response = await fetch('/api/maintenance');
      const stored: MaintenanceEntry[] = await response.json();
      
      if (!Array.isArray(stored)) {
        console.error('Invalid response format:', stored);
        setEntries([]);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updated = stored.map((entry) => {
        const lastDate = new Date(entry.date);
        lastDate.setHours(0, 0, 0, 0);
        const daysSince = Math.floor(
          (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isOverdue = entry.repeatInterval
          ? daysSince >= entry.repeatInterval
          : false;
        return { ...entry, overdue: isOverdue };
      });

      setEntries(updated);
    } catch (err) {
      console.error('Failed to load maintenance entries:', err);
      setEntries([]);
    }
  };

  const saveEntry = async () => {
    if (!type.trim()) {
      toast.error("Please enter the maintenance type.");
      return;
    }

    try {
      if (!userTankId) {
        toast.error('No tank found. Please wait for tank to load.');
        return;
      }

      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          task: type,
          notes,
          status: 'completed',
          repeat_interval: repeatInterval ? parseInt(repeatInterval) : null,
          tank_id: userTankId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save maintenance entry');
      }

      await refreshEntries();

      setType("");
      setNotes("");
      setCost("");
      setRepeatInterval("");
      setModalVisible(false);
    } catch (err) {
      console.error('Failed to save entry:', err);
      toast.error('Failed to save maintenance entry');
    }
  };

  const handleDeleteClick = (entryId: string) => {
    setDeleteEntryId(entryId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteEntryId) return;

    try {
      const response = await fetch(`/api/maintenance/${deleteEntryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      await refreshEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
      toast.error('Failed to delete maintenance entry');
    } finally {
      setShowDeleteModal(false);
      setDeleteEntryId(null);
    }
  };

  const displayed = showAll
    ? entries
    : entries.filter((entry) => entry.overdue);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Maintenance Tracker</h1>
          <button
            onClick={() => setModalVisible(true)}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold active:from-cyan-600 active:to-blue-600 transition"
          >
            + Add Entry
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <button
            onClick={() => setShowAll(true)}
            className={`flex-1 px-5 py-3 rounded-lg transition font-medium ${
              showAll
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 active:bg-gray-600"
            }`}
          >
            All Entries
          </button>
          <button
            onClick={() => setShowAll(false)}
            className={`flex-1 px-5 py-3 rounded-lg transition font-medium ${
              !showAll
                ? "bg-cyan-600 text-white"
                : "bg-gray-700 text-gray-300 active:bg-gray-600"
            }`}
          >
            Overdue Only
          </button>
        </div>

        <AdBanner />

        {/* Entries List */}
        {displayed.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">
              {showAll ? "No maintenance entries." : "No overdue maintenance."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((entry, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br rounded-lg p-6 border transition-all duration-300 hover:shadow-lg ${
                  entry.overdue
                    ? "from-red-900/30 to-orange-900/30 border-red-500/50 hover:border-red-400/70 hover:shadow-red-500/20"
                    : "from-gray-900 to-gray-800 border-gray-700 hover:border-cyan-500/50 hover:shadow-cyan-500/10"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {entry.type}
                      {entry.overdue && (
                        <span className="ml-2 text-red-400 text-sm">⚠️ OVERDUE</span>
                      )}
                    </h2>
                    <p className="text-gray-400 text-sm">Last done: {entry.date}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteClick((entry as any).id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  {entry.notes && (
                    <p className="text-gray-300">
                      <span className="font-semibold">Notes:</span> {entry.notes}
                    </p>
                  )}
                  {entry.cost && (
                    <p className="text-gray-300">
                      <span className="font-semibold">Cost:</span> ${entry.cost}
                    </p>
                  )}
                  {entry.repeatInterval && (
                    <p className="text-gray-300">
                      <span className="font-semibold">Repeat every:</span>{" "}
                      {entry.repeatInterval} days
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/50 rounded-lg p-6 max-w-md w-full animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🗑️</div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Entry?</h3>
                <p className="text-gray-400">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Entry Modal */}
        {modalVisible && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                Add Maintenance Entry
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Type *
                  </label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g., Filter change"
                    className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                    className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500 h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Cost ($)
                  </label>
                  <input
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g., 25.00"
                    className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    Repeat Interval (days)
                  </label>
                  <input
                    type="number"
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(e.target.value)}
                    placeholder="e.g., 30"
                    className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={saveEntry}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition"
                >
                  Save Entry
                </button>
                <button
                  onClick={() => {
                    setModalVisible(false);
                    setType("");
                    setNotes("");
                    setCost("");
                    setRepeatInterval("");
                  }}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
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
