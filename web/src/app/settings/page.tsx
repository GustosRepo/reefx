"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Threshold } from "@/utils/warningUtils";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser, logout, updateProfile, deleteAccount, updateUnitPreferences, User } from "@/utils/auth";
import { useRouter } from "next/navigation";
import type { TempUnit, VolumeUnit } from "@/utils/conversions";
import { exportLogs, exportMaintenance, exportEquipment, exportLivestock, exportAllData } from "@/utils/export";
import { useSubscription } from "@/context/SubscriptionContext";
import { useTank } from "@/context/TankContext";
import { TANK_LIMITS } from "@/utils/subscription";

interface Tank {
  id: string;
  name: string;
  size_gallons?: number;
  type?: string;
  setup_date?: string;
  notes?: string;
}

interface ThresholdSettings {
  [key: string]: { min: number; max: number };
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  );
}

function SettingsPageContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tempUnit, setTempUnit] = useState<TempUnit>('fahrenheit');
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>('gallons');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Tank management state
  const [showTankForm, setShowTankForm] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  const [tankForm, setTankForm] = useState({ name: '', size_gallons: '', type: '', setup_date: '', notes: '' });
  const [showDeleteTankModal, setShowDeleteTankModal] = useState(false);
  const [deleteTankId, setDeleteTankId] = useState<string | null>(null);
  const { subscription } = useSubscription();
  const { tanks, refreshTanks } = useTank();
  const tankLimit = TANK_LIMITS[subscription.tier];
  
  const [thresholds, setThresholds] = useState<ThresholdSettings>({
    temp: { min: 24, max: 27 },
    salinity: { min: 33, max: 36 },
    alk: { min: 7, max: 10 },
    ph: { min: 8.0, max: 8.4 },
    cal: { min: 400, max: 450 },
    mag: { min: 1250, max: 1400 },
    po4: { min: 0, max: 0.1 },
    no3: { min: 0, max: 10 },
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setTempUnit(currentUser.temp_unit);
        setVolumeUnit(currentUser.volume_unit);
      }
    };
    loadUser();
    loadThresholds();
  }, []);

  const loadThresholds = async () => {
    try {
      const response = await fetch('/api/thresholds');
      const data = await response.json();
      setThresholds({
        temp: { min: data.temp_min, max: data.temp_max },
        salinity: { min: data.salinity_min, max: data.salinity_max },
        alk: { min: data.alk_min, max: data.alk_max },
        ph: { min: data.ph_min, max: data.ph_max },
        cal: { min: data.cal_min, max: data.cal_max },
        mag: { min: data.mag_min, max: data.mag_max },
        po4: { min: data.po4_min, max: data.po4_max },
        no3: { min: data.no3_min, max: data.no3_max },
      });
    } catch (err) {
      console.error('Failed to load thresholds:', err);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/thresholds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp_min: thresholds.temp.min,
          temp_max: thresholds.temp.max,
          salinity_min: thresholds.salinity.min,
          salinity_max: thresholds.salinity.max,
          alk_min: thresholds.alk.min,
          alk_max: thresholds.alk.max,
          ph_min: thresholds.ph.min,
          ph_max: thresholds.ph.max,
          cal_min: thresholds.cal.min,
          cal_max: thresholds.cal.max,
          mag_min: thresholds.mag.min,
          mag_max: thresholds.mag.max,
          po4_min: thresholds.po4.min,
          po4_max: thresholds.po4.max,
          no3_min: thresholds.no3.min,
          no3_max: thresholds.no3.max,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save thresholds');
      }
      
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error('Failed to save thresholds:', err);
      toast.error('Failed to save settings');
    }
  };

  const handleSaveUnits = async () => {
    const result = await updateUnitPreferences(tempUnit, volumeUnit);
    if (result.success) {
      toast.success("Unit preferences saved!");
    } else {
      toast.error(`Error: ${result.error}`);
    }
  };

  const handleResetClick = () => {
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    const defaults: ThresholdSettings = {
      temp: { min: 75, max: 81 },
      salinity: { min: 33, max: 36 },
      alk: { min: 7, max: 10 },
      ph: { min: 8.0, max: 8.4 },
      cal: { min: 400, max: 450 },
      mag: { min: 1250, max: 1400 },
      po4: { min: 0, max: 0.1 },
      no3: { min: 0, max: 10 },
    };
    
    setThresholds(defaults);
    
    try {
      await fetch('/api/thresholds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp_min: defaults.temp.min,
          temp_max: defaults.temp.max,
          salinity_min: defaults.salinity.min,
          salinity_max: defaults.salinity.max,
          alk_min: defaults.alk.min,
          alk_max: defaults.alk.max,
          ph_min: defaults.ph.min,
          ph_max: defaults.ph.max,
          cal_min: defaults.cal.min,
          cal_max: defaults.cal.max,
          mag_min: defaults.mag.min,
          mag_max: defaults.mag.max,
          po4_min: defaults.po4.min,
          po4_max: defaults.po4.max,
          no3_min: defaults.no3.min,
          no3_max: defaults.no3.max,
        }),
      });
      toast.success("Thresholds reset to defaults!");
    } catch (err) {
      console.error('Failed to reset thresholds:', err);
      toast.error('Failed to reset thresholds');
    } finally {
      setShowResetModal(false);
    }
  };

  const handleClearDataClick = () => {
    setShowClearDataModal(true);
  };

  const confirmClearData = () => {
    localStorage.clear();
    toast.success("All data cleared. Refreshing...");
    window.location.reload();
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteAccountModal(true);
  };

  const confirmDeleteAccount = async () => {
    await deleteAccount();
    router.push("/register");
  };

  // Tank management functions
  const handleAddTank = () => {
    setEditingTank(null);
    setTankForm({ name: '', size_gallons: '', type: '', setup_date: '', notes: '' });
    setShowTankForm(true);
  };

  const handleEditTank = (tank: Tank) => {
    setEditingTank(tank);
    setTankForm({
      name: tank.name,
      size_gallons: tank.size_gallons?.toString() || '',
      type: tank.type || '',
      setup_date: tank.setup_date || '',
      notes: tank.notes || '',
    });
    setShowTankForm(true);
  };

  const handleSaveTank = async () => {
    if (!tankForm.name.trim()) {
      toast.error('Tank name is required');
      return;
    }

    try {
      const method = editingTank ? 'PUT' : 'POST';
      const body = editingTank
        ? { ...tankForm, id: editingTank.id, size_gallons: tankForm.size_gallons ? parseFloat(tankForm.size_gallons) : null }
        : { ...tankForm, size_gallons: tankForm.size_gallons ? parseFloat(tankForm.size_gallons) : null };

      const response = await fetch('/api/tanks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save tank');
      }

      toast.success(editingTank ? 'Tank updated!' : 'Tank created!');
      setShowTankForm(false);
      setEditingTank(null);
      setTankForm({ name: '', size_gallons: '', type: '', setup_date: '', notes: '' });
      refreshTanks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save tank');
    }
  };

  const handleDeleteTankClick = (tankId: string) => {
    setDeleteTankId(tankId);
    setShowDeleteTankModal(true);
  };

  const confirmDeleteTank = async () => {
    if (!deleteTankId) return;

    try {
      const response = await fetch(`/api/tanks?id=${deleteTankId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tank');
      }

      toast.success('Tank deleted');
      setShowDeleteTankModal(false);
      setDeleteTankId(null);
      refreshTanks();
    } catch (err) {
      toast.error('Failed to delete tank');
    }
  };

  const parameters = [
    { key: "temp", label: "Temperature (°C)", unit: "°C" },
    { key: "salinity", label: "Salinity", unit: "ppt" },
    { key: "alk", label: "Alkalinity", unit: "dKH" },
    { key: "ph", label: "pH", unit: "" },
    { key: "cal", label: "Calcium", unit: "ppm" },
    { key: "mag", label: "Magnesium", unit: "ppm" },
    { key: "po4", label: "Phosphate (PO₄)", unit: "ppm" },
    { key: "no3", label: "Nitrate (NO₃)", unit: "ppm" },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gradient mb-6">Settings</h1>

        {/* Unit Preferences */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">
            Unit Preferences
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Choose your preferred units for measurements
          </p>

          <div className="space-y-4">
            {/* Temperature Unit */}
            <div className="bg-black/40 rounded p-4">
              <label className="block text-white font-semibold mb-3">
                Temperature
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tempUnit"
                    value="fahrenheit"
                    checked={tempUnit === 'fahrenheit'}
                    onChange={(e) => setTempUnit(e.target.value as TempUnit)}
                    className="w-5 h-5 text-cyan-500"
                  />
                  <span className="text-white">Fahrenheit (°F)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tempUnit"
                    value="celsius"
                    checked={tempUnit === 'celsius'}
                    onChange={(e) => setTempUnit(e.target.value as TempUnit)}
                    className="w-5 h-5 text-cyan-500"
                  />
                  <span className="text-white">Celsius (°C)</span>
                </label>
              </div>
            </div>

            {/* Volume Unit */}
            <div className="bg-black/40 rounded p-4">
              <label className="block text-white font-semibold mb-3">
                Volume
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="volumeUnit"
                    value="gallons"
                    checked={volumeUnit === 'gallons'}
                    onChange={(e) => setVolumeUnit(e.target.value as VolumeUnit)}
                    className="w-5 h-5 text-cyan-500"
                  />
                  <span className="text-white">Gallons (gal)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="volumeUnit"
                    value="liters"
                    checked={volumeUnit === 'liters'}
                    onChange={(e) => setVolumeUnit(e.target.value as VolumeUnit)}
                    className="w-5 h-5 text-cyan-500"
                  />
                  <span className="text-white">Liters (L)</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveUnits}
            className="w-full py-4 mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold active:from-cyan-600 active:to-blue-600 transition text-base"
          >
            Save Unit Preferences
          </button>
        </div>

        {/* Tank Management */}
        <div id="tanks" className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                <span>🐠</span> Tank Management
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {tanks.length} of {tankLimit} tanks • {subscription.tier === 'super-premium' ? 'Super Premium' : subscription.tier === 'premium' ? 'Premium' : 'Free'}
              </p>
            </div>
            {tanks.length < tankLimit && (
              <button
                onClick={handleAddTank}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition text-sm"
              >
                + Add Tank
              </button>
            )}
          </div>

          {/* Tank limit warning */}
          {tanks.length >= tankLimit && subscription.tier !== 'super-premium' && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-400 text-sm">
                🔒 Tank limit reached! <a href="/subscription" className="underline hover:text-yellow-300">Upgrade to Super Premium</a> to manage up to 10 tanks.
              </p>
            </div>
          )}

          {/* Tank List */}
          <div className="space-y-3">
            {tanks.map((tank) => (
              <div
                key={tank.id}
                className="bg-black/40 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🐠</span>
                  <div>
                    <p className="font-semibold text-white">{tank.name}</p>
                    <p className="text-xs text-gray-400">
                      {tank.volume && `${tank.volume} gal`}
                      {tank.volume && tank.type && ' • '}
                      {tank.type}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditTank({
                      id: tank.id,
                      name: tank.name,
                      size_gallons: tank.volume,
                      type: tank.type,
                    })}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition"
                  >
                    Edit
                  </button>
                  {tanks.length > 1 && (
                    <button
                      onClick={() => handleDeleteTankClick(tank.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Tank Form Modal */}
          {showTankForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTankForm(false)}>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-4">
                  {editingTank ? 'Edit Tank' : 'Add New Tank'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tank Name *</label>
                    <input
                      type="text"
                      value={tankForm.name}
                      onChange={(e) => setTankForm({ ...tankForm, name: e.target.value })}
                      placeholder="e.g., Display Tank, Frag Tank"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Size (gallons)</label>
                      <input
                        type="number"
                        value={tankForm.size_gallons}
                        onChange={(e) => setTankForm({ ...tankForm, size_gallons: e.target.value })}
                        placeholder="0"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                      <select
                        value={tankForm.type}
                        onChange={(e) => setTankForm({ ...tankForm, type: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select type...</option>
                        <option value="reef">Reef</option>
                        <option value="fowlr">FOWLR</option>
                        <option value="frag">Frag</option>
                        <option value="quarantine">Quarantine</option>
                        <option value="nano">Nano</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Setup Date</label>
                    <input
                      type="date"
                      value={tankForm.setup_date}
                      onChange={(e) => setTankForm({ ...tankForm, setup_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                    <textarea
                      value={tankForm.notes}
                      onChange={(e) => setTankForm({ ...tankForm, notes: e.target.value })}
                      placeholder="Any additional notes..."
                      rows={2}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveTank}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                  >
                    {editingTank ? 'Update Tank' : 'Create Tank'}
                  </button>
                  <button
                    onClick={() => setShowTankForm(false)}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">
            Parameter Thresholds
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Set acceptable ranges for each parameter. You'll see warnings on the dashboard when values fall outside these ranges.
          </p>

          <div className="space-y-4">
            {parameters.map(({ key, label, unit }) => (
              <div
                key={key}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-black/40 rounded p-4"
              >
                <div>
                  <p className="font-semibold text-white">{label}</p>
                  {unit && <p className="text-gray-500 text-xs">{unit}</p>}
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Min
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={thresholds[key]?.min ?? ""}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        [key]: {
                          ...thresholds[key],
                          min: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-gray-950 border border-gray-600 rounded px-3 py-3 text-white text-base focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Max
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={thresholds[key]?.max ?? ""}
                    onChange={(e) =>
                      setThresholds({
                        ...thresholds,
                        [key]: {
                          ...thresholds[key],
                          max: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-gray-950 border border-gray-600 rounded px-3 py-3 text-white text-base focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold active:from-cyan-600 active:to-blue-600 transition text-base"
            >
              Save Thresholds
            </button>
            <button
              onClick={handleResetClick}
              className="sm:flex-none px-6 py-4 bg-gray-700 text-white rounded-lg active:bg-gray-600 transition text-base"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Signed in as</p>
              <p className="text-white font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Name</p>
              <p className="text-white font-semibold">{user?.name}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={() => router.push("/profile")}
              className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition font-semibold"
            >
              Edit Profile
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="flex-1 sm:flex-none px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Data Export Section */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <span>📦</span> Export Your Data
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Download your reef data as CSV files. Your data belongs to you.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/logs');
                  const data = await res.json();
                  if (Array.isArray(data) && data.length > 0) {
                    exportLogs(data);
                    toast.success('Logs exported!');
                  } else {
                    toast.error('No logs to export');
                  }
                } catch (err) {
                  toast.error('Export failed');
                }
              }}
              className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-500/30 transition text-center"
            >
              <span className="text-2xl block mb-2">📊</span>
              <span className="text-sm text-gray-300">Logs</span>
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/maintenance');
                  const data = await res.json();
                  if (Array.isArray(data) && data.length > 0) {
                    exportMaintenance(data);
                    toast.success('Maintenance exported!');
                  } else {
                    toast.error('No maintenance data to export');
                  }
                } catch (err) {
                  toast.error('Export failed');
                }
              }}
              className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-500/30 transition text-center"
            >
              <span className="text-2xl block mb-2">🔧</span>
              <span className="text-sm text-gray-300">Maintenance</span>
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/equipment');
                  const data = await res.json();
                  if (Array.isArray(data) && data.length > 0) {
                    exportEquipment(data);
                    toast.success('Equipment exported!');
                  } else {
                    toast.error('No equipment data to export');
                  }
                } catch (err) {
                  toast.error('Export failed');
                }
              }}
              className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-500/30 transition text-center"
            >
              <span className="text-2xl block mb-2">🛠️</span>
              <span className="text-sm text-gray-300">Equipment</span>
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/livestock');
                  const data = await res.json();
                  if (Array.isArray(data) && data.length > 0) {
                    exportLivestock(data);
                    toast.success('Livestock exported!');
                  } else {
                    toast.error('No livestock data to export');
                  }
                } catch (err) {
                  toast.error('Export failed');
                }
              }}
              className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-500/30 transition text-center"
            >
              <span className="text-2xl block mb-2">🐠</span>
              <span className="text-sm text-gray-300">Livestock</span>
            </button>
          </div>

          <button
            onClick={async () => {
              setExporting(true);
              try {
                await exportAllData();
                toast.success('All data exported!');
              } catch (err) {
                toast.error('Export failed');
              } finally {
                setExporting(false);
              }
            }}
            disabled={exporting}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>📥 Export All Data</>
            )}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="glass-card rounded-xl p-6 border-red-500/30">
          <h2 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
            <span>⚠️</span> Danger Zone
          </h2>
          <p className="text-gray-400 mb-4 text-sm">
            These actions cannot be undone. Proceed with caution.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClearDataClick}
              className="px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/30 transition font-semibold"
            >
              Clear All Data
            </button>
            <button
              onClick={handleDeleteAccountClick}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Reset Thresholds Modal */}
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowResetModal(false)}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/50 rounded-lg p-6 max-w-md w-full animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">↻</div>
                <h3 className="text-xl font-bold text-white mb-2">Reset to Defaults?</h3>
                <p className="text-gray-400">All custom thresholds will be reset to default values.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Data Modal */}
        {showClearDataModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowClearDataModal(false)}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/50 rounded-lg p-6 max-w-md w-full animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Clear All Data?</h3>
                <p className="text-gray-400 mb-2">This will delete ALL your data including:</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• All parameter logs</li>
                  <li>• Maintenance entries</li>
                  <li>• Custom settings</li>
                </ul>
                <p className="text-red-400 font-semibold mt-3">This cannot be undone!</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearDataModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearData}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteAccountModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteAccountModal(false)}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-600/50 rounded-lg p-6 max-w-md w-full animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🛑</div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Account?</h3>
                <p className="text-gray-400 mb-2">Your account and all associated data will be permanently deleted:</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Account and profile</li>
                  <li>• All parameter logs</li>
                  <li>• Equipment & livestock</li>
                  <li>• Maintenance history</li>
                  <li>• Subscription data</li>
                </ul>
                <p className="text-red-400 font-bold mt-3">THIS CANNOT BE UNDONE!</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteAccountModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  className="flex-1 px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-lg transition font-semibold"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Tank Modal */}
        {showDeleteTankModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteTankModal(false)}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/50 rounded-lg p-6 max-w-md w-full animate-fadeIn" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🗑️</div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Tank?</h3>
                <p className="text-gray-400">This will delete the tank and all associated logs, maintenance, and data. This cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteTankModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTank}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
                >
                  Delete Tank
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>REEFXONE - Web App Version</p>
          <p className="mt-1">Track your reef parameters, maintenance, and more</p>
        </div>
      </div>
    </AppLayout>
  );
}
