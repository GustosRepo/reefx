"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Threshold } from "@/utils/warningUtils";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser, logout, updateProfile, deleteAccount, updateUnitPreferences, User } from "@/utils/auth";
import { useRouter } from "next/navigation";
import type { TempUnit, VolumeUnit } from "@/utils/conversions";

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
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
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
              className="flex-1 sm:flex-none px-6 py-3 bg-cyan-600 text-white rounded-lg active:bg-cyan-700 transition font-semibold"
            >
              Edit Profile
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="flex-1 sm:flex-none px-6 py-3 bg-gray-700 text-white rounded-lg active:bg-gray-600 transition font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gradient-to-br from-red-900/30 to-red-900/20 border border-red-500/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-gray-400 mb-4 text-sm">
            These actions cannot be undone. Proceed with caution.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClearDataClick}
              className="px-6 py-3 bg-red-600 text-white rounded-lg active:bg-red-700 transition font-semibold"
            >
              Clear All Data
            </button>
            <button
              onClick={handleDeleteAccountClick}
              className="px-6 py-3 bg-red-700 text-white rounded-lg active:bg-red-800 transition font-semibold"
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

        {/* About Section */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>REEFXONE - Web App Version</p>
          <p className="mt-1">Track your reef parameters, maintenance, and more</p>
        </div>
      </div>
    </AppLayout>
  );
}
