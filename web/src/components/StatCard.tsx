"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  sparklineData?: number[];
  paramType?: "temp" | "salinity" | "alk" | "ph" | "cal" | "mag" | "po4" | "no3";
  warning?: boolean;
  danger?: boolean;
}

const paramColors: Record<string, { primary: string; gradient: string; glow: string }> = {
  temp: { primary: "#f97316", gradient: "from-orange-500/20 to-red-500/20", glow: "shadow-orange-500/30" },
  salinity: { primary: "#3b82f6", gradient: "from-blue-500/20 to-indigo-500/20", glow: "shadow-blue-500/30" },
  alk: { primary: "#8b5cf6", gradient: "from-violet-500/20 to-purple-500/20", glow: "shadow-violet-500/30" },
  ph: { primary: "#10b981", gradient: "from-emerald-500/20 to-green-500/20", glow: "shadow-emerald-500/30" },
  cal: { primary: "#06b6d4", gradient: "from-cyan-500/20 to-teal-500/20", glow: "shadow-cyan-500/30" },
  mag: { primary: "#ec4899", gradient: "from-pink-500/20 to-rose-500/20", glow: "shadow-pink-500/30" },
  po4: { primary: "#f59e0b", gradient: "from-amber-500/20 to-yellow-500/20", glow: "shadow-amber-500/30" },
  no3: { primary: "#ef4444", gradient: "from-red-500/20 to-orange-500/20", glow: "shadow-red-500/30" },
  default: { primary: "#06b6d4", gradient: "from-cyan-500/20 to-blue-500/20", glow: "shadow-cyan-500/30" },
};

// Mini sparkline component
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const width = 60;
  const height = 24;
  const padding = 2;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg width={width} height={height} className="opacity-60">
      <defs>
        <linearGradient id={`sparkline-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  sparklineData,
  paramType,
  warning,
  danger
}: StatCardProps) {
  const colors = paramColors[paramType || "default"];
  
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    stable: "text-slate-400",
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    stable: "→",
  };

  const cardClasses = useMemo(() => {
    let base = `relative rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] bg-white border border-slate-200 shadow-sm hover:shadow-md`;
    if (danger) {
      base += " border-red-400 shadow-red-100";
    } else if (warning) {
      base += " border-amber-400 shadow-amber-100";
    }
    return base;
  }, [warning, danger]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cardClasses}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl p-2 rounded-lg bg-slate-100">{icon}</div>
        <div className="flex items-center gap-2">
          {sparklineData && sparklineData.length > 1 && (
            <Sparkline data={sparklineData} color={colors.primary} />
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trendColors[trend]}`}>
              <span>{trendIcons[trend]}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">{title}</p>
        <motion.p 
          className="text-2xl font-bold text-slate-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={String(value)}
        >
          {value}
        </motion.p>
      </div>
      
      {/* Subtle accent bar */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-t-full opacity-60"
        style={{ background: colors.primary }}
      />
    </motion.div>
  );
}
