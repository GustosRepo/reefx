"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, MotionConfig } from "framer-motion";
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
import { useAquaMode, REEF_PARAMETERS, FRESHWATER_PARAMETERS } from "@/context/AquaModeContext";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { getCurrentUser, User } from "@/utils/auth";
import { fahrenheitToCelsius } from "@/utils/conversions";
import Link from "next/link";
import OnboardingModal, { OnboardingData } from "@/components/OnboardingModal";
import toast from "react-hot-toast";

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { currentTank, refreshTanks } = useTank();
  const { isReefMode, mode } = useAquaMode();
  const [alertsMuted, setAlertsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aquaxone_alerts_muted') === 'true';
    }
    return false;
  });
  const [maintenanceMuted, setMaintenanceMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aquaxone_maintenance_muted') === 'true';
    }
    return false;
  });

  // Get mode-specific parameters
  const modeParameters = isReefMode ? REEF_PARAMETERS : FRESHWATER_PARAMETERS;
  const paramKeys = modeParameters.map(p => p.key);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Check if user needs onboarding (no tanks or first visit)
      if (currentUser) {
        const hasSeenOnboarding = localStorage.getItem('aquaxone_onboarding_complete');
        if (!hasSeenOnboarding) {
          // Small delay to let the page load
          setTimeout(() => setShowOnboarding(true), 500);
        }
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (user && currentTank) {
      loadDashboardData(currentTank.id);
    }
  }, [user, currentTank?.id]);

  const loadDashboardData = useCallback(async (tankId: string) => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel for better performance
      const [logsResponse, thresholdsResponse, maintenanceResponse] = await Promise.all([
        fetch(`/api/logs?tank_id=${tankId}`),
        fetch('/api/thresholds'),
        fetch(`/api/maintenance?tank_id=${tankId}`)
      ]);
      
      const [logs, thresholdsData, maintenance]: [ReefForm[], any, MaintenanceEntry[]] = await Promise.all([
        logsResponse.json(),
        thresholdsResponse.json(),
        maintenanceResponse.json()
      ]);
      
      // Handle empty or error responses
      if (!Array.isArray(logs)) {
        setHasLogs(false);
        setIsLoading(false);
        return;
      }
      
      // Sort and take last 7 entries
      const sortedLogs = sortLogsByDate(logs);
      const recent = sortedLogs.slice(-7).filter((log) => log && log.date);

      // Build chart data - includes both reef and freshwater parameters
      const newChartData: Record<string, number[]> = {
        // Shared
        temp: [],
        ph: [],
        po4: [],
        no3: [],
        // Reef specific
        salinity: [],
        alk: [],
        cal: [],
        mag: [],
        // Freshwater specific
        gh: [],
        kh: [],
        ammonia: [],
        no2: [],
      };

      recent.forEach((entry) => {
        if (!entry) return;
        // Temperature is stored in Fahrenheit, convert if user prefers Celsius
        let tempValue = parseFloat(String(entry.temp)) || 0;
        if (user?.temp_unit === 'celsius' && tempValue > 0) {
          tempValue = fahrenheitToCelsius(tempValue);
        }
        // Shared
        newChartData.temp.push(tempValue);
        newChartData.ph.push(parseFloat(String(entry.ph)) || 0);
        newChartData.po4.push(parseFloat(String(entry.po4)) || 0);
        newChartData.no3.push(parseFloat(String(entry.no3)) || 0);
        // Reef specific
        newChartData.salinity.push(parseFloat(String(entry.salinity)) || 0);
        newChartData.alk.push(parseFloat(String(entry.alk)) || 0);
        newChartData.cal.push(parseFloat(String(entry.cal)) || 0);
        newChartData.mag.push(parseFloat(String(entry.mag)) || 0);
        // Freshwater specific
        newChartData.gh.push(parseFloat(String(entry.gh)) || 0);
        newChartData.kh.push(parseFloat(String(entry.kh)) || 0);
        newChartData.ammonia.push(parseFloat(String(entry.ammonia)) || 0);
        newChartData.no2.push(parseFloat(String(entry.no2)) || 0);
      });

      setChartData(newChartData);
      setHasLogs(recent.length > 0);
      setLabels(recent.map((entry) => entry.date));

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

      // Check overdue maintenance (already fetched in parallel)
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
  }, [user?.temp_unit]);

  // Build labelMap and paramIcons from mode parameters - memoized
  const { labelMap, paramIcons } = useMemo(() => {
    const labels: Record<string, string> = {};
    const icons: Record<string, string> = {};
    modeParameters.forEach(p => {
      labels[p.key] = p.label;
      icons[p.key] = p.icon;
    });
    return { labelMap: labels, paramIcons: icons };
  }, [modeParameters]);

  const paramColors: Record<string, { stroke: string; fill: string }> = {
    // Shared
    temp: { stroke: "#f97316", fill: "url(#tempGradient)" },
    ph: { stroke: "#10b981", fill: "url(#phGradient)" },
    po4: { stroke: "#f59e0b", fill: "url(#po4Gradient)" },
    no3: { stroke: "#ef4444", fill: "url(#no3Gradient)" },
    // Reef specific
    salinity: { stroke: "#3b82f6", fill: "url(#salinityGradient)" },
    alk: { stroke: "#8b5cf6", fill: "url(#alkGradient)" },
    cal: { stroke: "#06b6d4", fill: "url(#calGradient)" },
    mag: { stroke: "#ec4899", fill: "url(#magGradient)" },
    // Freshwater specific
    gh: { stroke: "#3b82f6", fill: "url(#ghGradient)" },
    kh: { stroke: "#8b5cf6", fill: "url(#khGradient)" },
    ammonia: { stroke: "#dc2626", fill: "url(#ammoniaGradient)" },
    no2: { stroke: "#f97316", fill: "url(#no2Gradient)" },
  };

  // Memoize chart data formatting
  const formattedChartData = useMemo(() => {
    const formatted: Record<string, { date: string; value: number }[]> = {};
    Object.keys(labelMap).forEach(param => {
      formatted[param] = labels.map((date, index) => ({
        date: date.substring(5), // Show MM-DD
        value: chartData[param]?.[index] || 0,
      }));
    });
    return formatted;
  }, [labels, chartData, labelMap]);

  // Handle onboarding completion
  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      // Update the user's first tank with onboarding data
      const response = await fetch('/api/tanks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.tankName,
          size_gallons: data.tankSize ? parseFloat(data.tankSize) : null,
          type: data.tankType,
          aqua_mode: data.aquaMode,
        }),
      });

      if (!response.ok) {
        // If tank creation fails (might already have default tank), try to update it
        const tanksRes = await fetch('/api/tanks');
        const tanks = await tanksRes.json();
        if (tanks.length > 0) {
          await fetch('/api/tanks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: tanks[0].id,
              name: data.tankName,
              size_gallons: data.tankSize ? parseFloat(data.tankSize) : null,
              type: data.tankType,
              aqua_mode: data.aquaMode,
            }),
          });
        }
      }

      // Mark onboarding as complete
      localStorage.setItem('aquaxone_onboarding_complete', 'true');
      setShowOnboarding(false);
      refreshTanks();
      toast.success(`Welcome! Your ${data.aquaMode === 'reef' ? 'reef' : 'freshwater'} tank is ready!`);
    } catch (err) {
      console.error('Onboarding error:', err);
      localStorage.setItem('aquaxone_onboarding_complete', 'true');
      setShowOnboarding(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          userName={user?.name?.split(' ')[0]}
        />
      </AppLayout>
    );
  }

  if (!hasLogs) {
    return (
      <AppLayout>
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          userName={user?.name?.split(' ')[0]}
        />
        <div className="max-w-2xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-2">AQUAXONE</h1>
            <p className="text-slate-500">Your aquarium journey begins here</p>
          </motion.div>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <EmptyState
              variant="coral"
              title="Welcome to Your Dashboard!"
              description="Start tracking your aquarium parameters to see beautiful charts, trends, and get smart alerts when things need attention."
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
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        userName={user?.name?.split(' ')[0]}
      />
      <div className="space-y-8 min-h-screen">
        {/* Header with animated gradient */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient gradient-animate mb-2">AQUAXONE</h1>
          <p className="text-slate-500 text-lg">Your aquarium parameters at a glance</p>
          
          {/* Quick action button */}
          <Link
            href="/log"
            className="absolute right-0 top-0 bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white px-4 py-2 rounded-xl font-medium text-sm hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg hidden md:flex items-center gap-2"
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
            className="bg-white border border-red-200 rounded-xl p-4 md:p-6 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold text-red-500 flex items-center gap-2">
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
                  localStorage.setItem('aquaxone_alerts_muted', 'true');
                }}
                className="text-sm text-slate-500 hover:text-slate-700 transition px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                🔕 Mute
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {Object.entries(warnings).map(([param, warning]) =>
                warning ? (
                  <motion.div 
                    key={param} 
                    className="bg-red-50 rounded-lg p-3 flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="text-xl">{paramIcons[param]}</span>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm md:text-base">{labelMap[param]}</p>
                      <p className="text-red-600 text-xs md:text-sm">{warning}</p>
                    </div>
                  </motion.div>
                ) : null
              )}
            </div>
          </motion.div>
        )}

        {/* Muted Alerts Indicator */}
        {Object.values(warnings).some((w) => w) && alertsMuted && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>🔕</span>
              <span>Alerts muted ({Object.values(warnings).filter((w) => w).length} warnings hidden)</span>
            </div>
            <button
              onClick={() => {
                setAlertsMuted(false);
                localStorage.setItem('aquaxone_alerts_muted', 'false');
              }}
              className="text-sm text-[var(--aqua-accent-primary)] hover:underline transition px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200"
            >
              Show Alerts
            </button>
          </div>
        )}

        {/* Overdue Maintenance */}
        {overdueMaintenance.length > 0 && !maintenanceMuted && (
          <motion.div 
            className="bg-white border border-amber-200 rounded-xl p-4 md:p-6 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold text-amber-500 flex items-center gap-2">
                <span>🔧</span> Overdue Maintenance
              </h2>
              <button
                onClick={() => {
                  setMaintenanceMuted(true);
                  localStorage.setItem('aquaxone_maintenance_muted', 'true');
                }}
                className="text-sm text-slate-500 hover:text-slate-700 transition px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                🔕 Mute
              </button>
            </div>
            <ul className="space-y-2">
              {overdueMaintenance.map((item, index) => (
                <li key={index} className="bg-amber-50 rounded-lg p-3">
                  <p className="font-semibold text-slate-800 text-sm md:text-base">{item.type}</p>
                  <p className="text-xs md:text-sm text-slate-500">Last done: {item.date}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Show Maintenance Button (when muted) */}
        {overdueMaintenance.length > 0 && maintenanceMuted && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-slate-500 mb-2">🔕 Overdue maintenance muted ({overdueMaintenance.length} {overdueMaintenance.length === 1 ? 'task' : 'tasks'})</p>
            <button
              onClick={() => {
                setMaintenanceMuted(false);
                localStorage.setItem('aquaxone_maintenance_muted', 'false');
              }}
              className="text-sm bg-amber-100 text-amber-600 px-4 py-2 rounded-lg border border-amber-300 hover:border-amber-400 transition"
            >
              Show Maintenance
            </button>
          </div>
        )}

        {/* Parameter Charts - Optimized rendering */}
        <MotionConfig reducedMotion="user">
          <div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative isolate animate-fadeIn"
          >
            {Object.keys(labelMap).map((param) => (
              <div 
                key={param}
                className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow duration-300 overflow-hidden shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{paramIcons[param]}</span>
                  <h3 className="text-base md:text-lg font-bold" style={{ color: paramColors[param].stroke }}>{labelMap[param]}</h3>
                </div>
                {formattedChartData[param]?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={formattedChartData[param]}>
                      <defs>
                        <linearGradient id={`${param}Gradient`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={paramColors[param].stroke} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={paramColors[param].stroke} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} horizontal={true} vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          color: "#0f172a",
                          fontSize: 12,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        labelStyle={{ color: "#64748b" }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={paramColors[param].stroke} 
                        strokeWidth={2} 
                        fill={`url(#${param}Gradient)`}
                        dot={false}
                        activeDot={{ r: 5, stroke: paramColors[param].stroke, strokeWidth: 2, fill: "#ffffff" }}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <span className="text-3xl mb-2 opacity-50">{paramIcons[param]}</span>
                    <p className="text-sm">No data yet</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </MotionConfig>

        {/* Floating Action Button for Mobile */}
        <Link
          href="/log"
          className="fab md:hidden bg-gradient-to-r from-[var(--aqua-accent-primary)] to-[var(--aqua-accent-tertiary)] text-white text-2xl"
        >
          +
        </Link>
      </div>
    </AppLayout>
  );
}
