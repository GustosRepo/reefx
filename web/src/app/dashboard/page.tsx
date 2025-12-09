"use client";

import { useState, useEffect } from "react";
import { ReefForm, MaintenanceEntry } from "@/types";
import { getWarning } from "@/utils/warningUtils";
import { sortLogsByDate } from "@/utils/dateUtils";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatCard from "@/components/StatCard";
import AdBanner from "@/components/AdBanner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getCurrentUser, User } from "@/utils/auth";
import { fahrenheitToCelsius } from "@/utils/conversions";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [chartData, setChartData] = useState<Record<string, number[]>>({});
  const [labels, setLabels] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<Record<string, string | null>>({});
  const [overdueMaintenance, setOverdueMaintenance] = useState<MaintenanceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLogs, setHasLogs] = useState(false);
  const [alertsMuted, setAlertsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reefxone_alerts_muted') === 'true';
    }
    return false;
  });
  const [maintenanceMuted, setMaintenanceMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reefxone_maintenance_muted') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/logs');
      const logs: ReefForm[] = await response.json();
      
      // Handle empty or error responses
      if (!Array.isArray(logs)) {
        setHasLogs(false);
        setIsLoading(false);
        return;
      }
      
      // Sort and take last 7 entries
      const sortedLogs = sortLogsByDate(logs);
      const recent = sortedLogs.slice(-7).filter((log) => log && log.date);

      // Build chart data
      const newChartData: Record<string, number[]> = {
        temp: [],
        salinity: [],
        alk: [],
        ph: [],
        cal: [],
        mag: [],
        po4: [],
        no3: [],
      };

      recent.forEach((entry) => {
        if (!entry) return;
        // Temperature is stored in Fahrenheit, convert if user prefers Celsius
        let tempValue = parseFloat(String(entry.temp)) || 0;
        if (user?.temp_unit === 'celsius' && tempValue > 0) {
          tempValue = fahrenheitToCelsius(tempValue);
        }
        newChartData.temp.push(tempValue);
        newChartData.salinity.push(parseFloat(String(entry.salinity)) || 0);
        newChartData.alk.push(parseFloat(String(entry.alk)) || 0);
        newChartData.ph.push(parseFloat(String(entry.ph)) || 0);
        newChartData.cal.push(parseFloat(String(entry.cal)) || 0);
        newChartData.mag.push(parseFloat(String(entry.mag)) || 0);
        newChartData.po4.push(parseFloat(String(entry.po4)) || 0);
        newChartData.no3.push(parseFloat(String(entry.no3)) || 0);
      });

      setChartData(newChartData);
      setHasLogs(recent.length > 0);
      setLabels(recent.map((entry) => entry.date));

      // Compute warnings
      const thresholdsResponse = await fetch('/api/thresholds');
      const thresholdsData = await thresholdsResponse.json();
      
      // Convert API format to legacy format for getWarning function
      const thresholds: Record<string, { min: number; max: number }> = {
        temp: { min: thresholdsData.temp_min, max: thresholdsData.temp_max },
        salinity: { min: thresholdsData.salinity_min, max: thresholdsData.salinity_max },
        alk: { min: thresholdsData.alk_min, max: thresholdsData.alk_max },
        ph: { min: thresholdsData.ph_min, max: thresholdsData.ph_max },
        cal: { min: thresholdsData.cal_min, max: thresholdsData.cal_max },
        mag: { min: thresholdsData.mag_min, max: thresholdsData.mag_max },
        po4: { min: thresholdsData.po4_min, max: thresholdsData.po4_max },
        no3: { min: thresholdsData.no3_min, max: thresholdsData.no3_max },
      };
      
      const latestWarnings: Record<string, string | null> = {};

      for (const param of Object.keys(newChartData)) {
        const series = newChartData[param];
        if (series.length > 0) {
          const latest = series[series.length - 1];
          latestWarnings[param] = getWarning(latest, thresholds[param]);
        }
      }
      setWarnings(latestWarnings);

      // Check overdue maintenance
      const maintenanceResponse = await fetch('/api/maintenance');
      const maintenance: MaintenanceEntry[] = await maintenanceResponse.json();
      
      if (Array.isArray(maintenance)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const overdueItems = maintenance.filter((entry) => {
          if (!entry.repeatInterval) return false;
          const lastDate = new Date(entry.date);
          lastDate.setHours(0, 0, 0, 0);
          const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysSince >= entry.repeatInterval;
        });
        
        setOverdueMaintenance(overdueItems);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const labelMap: Record<string, string> = {
    temp: "Temperature (°C)",
    salinity: "Salinity (ppt)",
    alk: "ALK (dKH)",
    ph: "pH",
    cal: "Calcium (ppm)",
    mag: "Magnesium (ppm)",
    po4: "Phosphate (PO₄)",
    no3: "Nitrate (NO₃)",
  };

  const formatChartData = (param: string) => {
    return labels.map((date, index) => ({
      date: date.substring(5), // Show MM-DD
      value: chartData[param]?.[index] || 0,
    }));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gradient">REEFX ONE</h1>
          <div className="flex items-center gap-3">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
            <p className="text-gray-400">Loading your reef data...</p>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (!hasLogs) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
          <h1 className="text-4xl font-bold text-gradient">REEFX ONE</h1>
          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-8">
            <p className="text-xl text-gray-300 mb-4">Welcome to your reef dashboard!</p>
            <p className="text-gray-400 mb-6">
              No logs yet. Start by logging your first reef parameters.
            </p>
            <a
              href="/log"
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition"
            >
              Log Parameters
            </a>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fadeIn">
        <div className="animate-slideDown">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2">REEFXONE</h1>
          <p className="text-gray-400 text-lg">Your reef parameters at a glance</p>
        </div>

        {/* Quick Stats */}
        {hasLogs && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Logs"
              value={labels.length}
              icon="📊"
              trend="up"
              trendValue={`${labels.length} entries`}
            />
            <StatCard
              title="Latest Temp"
              value={`${(chartData.temp?.[chartData.temp.length - 1] || 0).toFixed(1)}${user?.temp_unit === 'celsius' ? '°C' : '°F'}`}
              icon="🌡️"
            />
            <StatCard
              title="Latest pH"
              value={chartData.ph?.[chartData.ph.length - 1] || 0}
              icon="⚗️"
            />
            <StatCard
              title="Active Alerts"
              value={Object.values(warnings).filter((w) => w).length}
              icon="⚠️"
              trend={Object.values(warnings).filter((w) => w).length > 0 ? "up" : "stable"}
              trendValue={`${Object.values(warnings).filter((w) => w).length} warnings`}
            />
          </div>
        )}

        {/* Ad Banner for Free Users */}
        <AdBanner />

        {/* Warnings Section */}
        {Object.values(warnings).some((w) => w) && !alertsMuted && (
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-500/50 rounded-lg p-4 md:p-6 animate-pulse-slow hover:border-red-400/70 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold text-red-400 flex items-center gap-2">
                <span className="animate-bounce">⚠️</span> Alerts
              </h2>
              <button
                onClick={() => {
                  setAlertsMuted(true);
                  localStorage.setItem('reefxone_alerts_muted', 'true');
                }}
                className="text-sm text-gray-400 hover:text-white transition px-3 py-1 rounded bg-black/40 hover:bg-black/60"
              >
                🔕 Mute
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {Object.entries(warnings).map(([param, warning]) =>
                warning ? (
                  <div key={param} className="bg-black/40 rounded p-3">
                    <p className="font-semibold text-white text-sm md:text-base">{labelMap[param]}</p>
                    <p className="text-red-300 text-xs md:text-sm">{warning}</p>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Muted Alerts Indicator */}
        {Object.values(warnings).some((w) => w) && alertsMuted && (
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>🔕</span>
              <span>Alerts muted ({Object.values(warnings).filter((w) => w).length} warnings hidden)</span>
            </div>
            <button
              onClick={() => {
                setAlertsMuted(false);
                localStorage.setItem('reefxone_alerts_muted', 'false');
              }}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition px-3 py-1 rounded bg-black/40 hover:bg-black/60"
            >
              Show Alerts
            </button>
          </div>
        )}

        {/* Overdue Maintenance */}
        {overdueMaintenance.length > 0 && !maintenanceMuted && (
          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 rounded-lg p-4 md:p-6 hover:border-yellow-400/70 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold text-yellow-400 flex items-center gap-2">
                <span className="animate-pulse">🔧</span> Overdue Maintenance
              </h2>
              <button
                onClick={() => {
                  setMaintenanceMuted(true);
                  localStorage.setItem('reefxone_maintenance_muted', 'true');
                }}
                className="text-sm text-gray-400 hover:text-white transition px-3 py-1 rounded bg-black/40 hover:bg-black/60"
              >
                🔕 Mute
              </button>
            </div>
            <ul className="space-y-2">
              {overdueMaintenance.map((item, index) => (
                <li key={index} className="bg-black/40 rounded p-3">
                  <p className="font-semibold text-white text-sm md:text-base">{item.type}</p>
                  <p className="text-xs md:text-sm text-gray-400">Last done: {item.date}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Show Maintenance Button (when muted) */}
        {overdueMaintenance.length > 0 && maintenanceMuted && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-400 mb-2">🔕 Overdue maintenance muted ({overdueMaintenance.length} {overdueMaintenance.length === 1 ? 'task' : 'tasks'})</p>
            <button
              onClick={() => {
                setMaintenanceMuted(false);
                localStorage.setItem('reefxone_maintenance_muted', 'false');
              }}
              className="text-sm bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 px-4 py-2 rounded border border-yellow-500/30 hover:border-yellow-400/50 transition"
            >
              Show Maintenance
            </button>
          </div>
        )}

        {/* Parameter Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {Object.keys(labelMap).map((param) => (
            <div key={param}>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                <h3 className="text-base md:text-lg font-bold text-cyan-400 mb-3 md:mb-4">{labelMap[param]}</h3>
                {chartData[param]?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={formatChartData(param)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: 10 }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 12,
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8 text-sm">No data</p>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
