"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

export default function StatCard({ title, value, icon, trend, trendValue }: StatCardProps) {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    stable: "text-gray-400",
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    stable: "→",
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trendColors[trend]}`}>
            <span>{trendIcons[trend]}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
