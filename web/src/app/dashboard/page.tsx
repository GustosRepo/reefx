"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ReefForm, MaintenanceEntry } from "@/types";
import { getWarning } from "@/utils/warningUtils";
import { sortLogsByDate } from "@/utils/dateUtils";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatCard from "@/components/StatCard";
import AdBanner from "@/components/AdBanner";
import EmptyState from "@/components/EmptyState";
import { DashboardSkeleton } from "@/components/Skeleton";
import { useTank } from "@/context/TankContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { getCurrentUser, User } from "@/utils/auth";
import { fahrenheitToCelsius } from "@/utils/conversions";
import Link from "next/link";

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
  const { currentTank } = useTank();
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
    if (user && currentTank) {
      loadDashboardData(currentTank.id);
    }
  }, [user, currentTank?.id]);

  const loadDashboardData = async (tankId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/logs?tank_id=${tankId}`);
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

      // Check overdue maintenance (filtered by current tank)
      const maintenanceResponse = await fetch(`/api/maintenance?tank_id=${tankId}`);
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
    temp: "Temperature",
    salinity: "Salinity (ppt)",
    alk: "Alkalinity (dKH)",
    ph: "pH",
    cal: "Calcium (ppm)",
    mag: "Magnesium (ppm)",
    po4: "Phosphate (PO₄)",
    no3: "Nitrate (NO₃)",
  };

  const paramIcons: Record<string, string> = {
    temp: "🌡️",
    salinity: "🧂",
    alk: "⚗️",
    ph: "🔬",
    cal: "💎",
    mag: "✨",
    po4: "🧪",
    no3: "📊",
  };

  const paramColors: Record<string, { stroke: string; fill: string }> = {
    temp: { stroke: "#f97316", fill: "url(#tempGradient)" },
    salinity: { stroke: "#3b82f6", fill: "url(#salinityGradient)" },
    alk: { stroke: "#8b5cf6", fill: "url(#alkGradient)" },
    ph: { stroke: "#10b981", fill: "url(#phGradient)" },
    cal: { stroke: "#06b6d4", fill: "url(#calGradient)" },
    mag: { stroke: "#ec4899", fill: "url(#magGradient)" },
    po4: { stroke: "#f59e0b", fill: "url(#po4Gradient)" },
    no3: { stroke: "#ef4444", fill: "url(#no3Gradient)" },
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
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  if (!hasLogs) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2">REEFXONE</h1>
            <p className="text-gray-400">Your reef journey begins here</p>
          </motion.div>
          
          <div className="glass-card rounded-2xl p-8">
            <EmptyState
              variant="coral"
              title="Welcome to Your Reef Dashboard!"
              description="Start tracking your reef parameters to see beautiful charts, trends, and get smart alerts when things need attention."
              actionLabel="📝 Log Your First Parameters"
              actionHref="/log"
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 reef-bg min-h-screen -mx-4 -mt-4 px-4 pt-4 md:-mx-6 md:-mt-6 md:px-6 md:pt-6">
        {/* Header with animated gradient */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient gradient-animate mb-2">REEFXONE</h1>
          <p className="text-gray-400 text-lg">Your reef parameters at a glance</p>
          
          {/* Quick action button */}
          <Link
            href="/log"
            className="absolute right-0 top-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium text-sm hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 hidden md:flex items-center gap-2"
          >
            <span>+</span> New Log
          </Link>
        </motion.div>

        {/* Quick Stats with enhanced cards */}
        {hasLogs && (
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatCard
              title="Total Logs"
              value={labels.length}
              icon="📊"
              trend="up"
              trendValue={`${labels.length} entries`}
              sparklineData={chartData.alk}
            />
            <StatCard
              title="Temperature"
              value={`${(chartData.temp?.[chartData.temp.length - 1] || 0).toFixed(1)}${user?.temp_unit === 'celsius' ? '°C' : '°F'}`}
              icon="🌡️"
              paramType="temp"
              sparklineData={chartData.temp}
              warning={!!warnings.temp}
            />
            <StatCard
              title="pH Level"
              value={(chartData.ph?.[chartData.ph.length - 1] || 0).toFixed(2)}
              icon="🔬"
              paramType="ph"
              sparklineData={chartData.ph}
              warning={!!warnings.ph}
            />
            <StatCard
              title="Active Alerts"
              value={Object.values(warnings).filter((w) => w).length}
              icon="⚠️"
              trend={Object.values(warnings).filter((w) => w).length > 0 ? "up" : "stable"}
              trendValue={`${Object.values(warnings).filter((w) => w).length} warnings`}
              danger={Object.values(warnings).filter((w) => w).length > 0}
            />
          </motion.div>
        )}

        {/* Ad Banner for Free Users */}
        <AdBanner />

        {/* Warnings Section */}
        {Object.values(warnings).some((w) => w) && !alertsMuted && (
          <motion.div 
            className="glass-card rounded-xl p-4 md:p-6 border-red-500/50 glow-danger"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold text-red-400 flex items-center gap-2">
                <motion.span 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  ⚠️
                </motion.span> 
                Parameter Alerts
              </h2>
              <button
                onClick={() => {
                  setAlertsMuted(true);
                  localStorage.setItem('reefxone_alerts_muted', 'true');
                }}
                className="text-sm text-gray-400 hover:text-white transition px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10"
              >
                🔕 Mute
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {Object.entries(warnings).map(([param, warning]) =>
                warning ? (
                  <motion.div 
                    key={param} 
                    className="bg-black/40 rounded-lg p-3 flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="text-xl">{paramIcons[param]}</span>
                    <div>
                      <p className="font-semibold text-white text-sm md:text-base">{labelMap[param]}</p>
                      <p className="text-red-300 text-xs md:text-sm">{warning}</p>
                    </div>
                  </motion.div>
                ) : null
              )}
            </div>
          </motion.div>
        )}

        {/* Muted Alerts Indicator */}
        {Object.values(warnings).some((w) => w) && alertsMuted && (
          <div className="glass-card rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>🔕</span>
              <span>Alerts muted ({Object.values(warnings).filter((w) => w).length} warnings hidden)</span>
            </div>
            <button
              onClick={() => {
                setAlertsMuted(false);
                localStorage.setItem('reefxone_alerts_muted', 'false');
              }}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10"
            >
              Show Alerts
            </button>
          </div>
        )}

        {/* Overdue Maintenance */}
        {overdueMaintenance.length > 0 && !maintenanceMuted && (
          <motion.div 
            className="glass-card rounded-xl p-4 md:p-6 border-amber-500/50 glow-warning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold text-amber-400 flex items-center gap-2">
                <span>🔧</span> Overdue Maintenance
              </h2>
              <button
                onClick={() => {
                  setMaintenanceMuted(true);
                  localStorage.setItem('reefxone_maintenance_muted', 'true');
                }}
                className="text-sm text-gray-400 hover:text-white transition px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10"
              >
                🔕 Mute
              </button>
            </div>
            <ul className="space-y-2">
              {overdueMaintenance.map((item, index) => (
                <li key={index} className="bg-black/40 rounded-lg p-3">
                  <p className="font-semibold text-white text-sm md:text-base">{item.type}</p>
                  <p className="text-xs md:text-sm text-gray-400">Last done: {item.date}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Show Maintenance Button (when muted) */}
        {overdueMaintenance.length > 0 && maintenanceMuted && (
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-gray-400 mb-2">🔕 Overdue maintenance muted ({overdueMaintenance.length} {overdueMaintenance.length === 1 ? 'task' : 'tasks'})</p>
            <button
              onClick={() => {
                setMaintenanceMuted(false);
                localStorage.setItem('reefxone_maintenance_muted', 'false');
              }}
              className="text-sm bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 px-4 py-2 rounded-lg border border-amber-500/30 hover:border-amber-400/50 transition"
            >
              Show Maintenance
            </button>
          </div>
        )}

        {/* Parameter Charts - Enhanced with gradients */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative isolate"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {Object.keys(labelMap).map((param, index) => (
            <motion.div 
              key={param}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="glass-card rounded-xl p-4 md:p-6 hover:scale-[1.01] transition-transform duration-300 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{paramIcons[param]}</span>
                <h3 className="text-base md:text-lg font-bold" style={{ color: paramColors[param].stroke }}>{labelMap[param]}</h3>
              </div>
              {chartData[param]?.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={formatChartData(param)}>
                    <defs>
                      <linearGradient id={`${param}Gradient`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={paramColors[param].stroke} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={paramColors[param].stroke} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0} horizontal={false} vertical={false} />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6b7280" style={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "#fff",
                        fontSize: 12,
                        backdropFilter: "blur(10px)",
                      }}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={paramColors[param].stroke} 
                      strokeWidth={2} 
                      fill={`url(#${param}Gradient)`}
                      dot={{ fill: paramColors[param].stroke, r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, stroke: paramColors[param].stroke, strokeWidth: 2, fill: "#0f172a" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <span className="text-3xl mb-2 opacity-50">{paramIcons[param]}</span>
                  <p className="text-sm">No data yet</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Action Button for Mobile */}
        <Link
          href="/log"
          className="fab md:hidden bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-2xl"
        >
          +
        </Link>
      </div>
    </AppLayout>
  );
}
