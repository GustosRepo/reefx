import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const initialData = [
    { day: "Mon", alk: 8.2 },
    { day: "Tue", alk: 8.3 },
    { day: "Wed", alk: 8.5 },
    { day: "Thu", alk: 8.4 },
    { day: "Fri", alk: 8.6 },
    { day: "Sat", alk: 8.5 },
    { day: "Sun", alk: 8.4 },
];

export default function AlkTrendChart() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        // Simulate data loading to trigger animation
        setTimeout(() => setData(initialData), 100);
    }, []);

    return (
        <div className="w-full max-w-3xl p-4 mx-auto mt-12 border shadow-inner rounded-xl bg-white/5 border-white/10 backdrop-blur">
            <p className="mb-2 text-sm text-gray-400">ALK Trend - Last 7 Days</p>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis domain={[8.0, 9.0]} stroke="#94a3b8" />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="alk"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease"
                            dot={({ cx, cy, key }) => (
                                <motion.circle
                                    key={key}
                                    cx={cx}
                                    cy={cy}
                                    r={4}
                                    fill="#0ea5e9"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 10,
                                        delay: (Number(key) || 0) * 0.1,
                                    }}
                                />
                            )}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}