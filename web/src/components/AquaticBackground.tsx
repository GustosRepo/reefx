"use client";

import { useEffect, useRef, useState } from "react";
import { useAquaMode } from "@/context/AquaModeContext";

/**
 * AquaticBackground - Animated SVG overlay for the web app
 * Adds surface waves, drifting clouds, and floating bubbles
 * Matches the mobile app's AquaticBackground component
 */
export default function AquaticBackground() {
  const { mode } = useAquaMode();
  const isReef = mode !== "freshwater";

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <Clouds isReef={isReef} />
      <SurfaceWaves isReef={isReef} />
      <FloatingBubbles isReef={isReef} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SURFACE WAVES - 3 layered animated wave paths near the top
   ───────────────────────────────────────────────────────────────────────── */
function SurfaceWaves({ isReef }: { isReef: boolean }) {
  const [width, setWidth] = useState(1440);

  useEffect(() => {
    setWidth(window.innerWidth);
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const w = width + 60;

  const colors = isReef
    ? ["rgba(8,145,178,0.22)", "rgba(6,182,212,0.17)", "rgba(34,211,238,0.12)"]
    : ["rgba(5,150,105,0.22)", "rgba(16,185,129,0.17)", "rgba(52,211,153,0.12)"];

  return (
    <div className="absolute top-0 left-0 right-0">
      {/* Wave 1 - deepest, slowest */}
      <svg
        className="animate-wave-drift-1"
        width={w}
        height={80}
        viewBox={`0 0 ${w} 80`}
        style={{ display: "block", marginLeft: -30 }}
      >
        <path
          d={`M0 50 Q${w * 0.1} 25 ${w * 0.25} 45 Q${w * 0.4} 65 ${w * 0.55} 40 Q${w * 0.7} 15 ${w * 0.85} 42 Q${w} 70 ${w} 35 L${w} 0 L0 0 Z`}
          fill={colors[0]}
        />
      </svg>

      {/* Wave 2 - mid layer */}
      <svg
        className="animate-wave-drift-2"
        width={w}
        height={70}
        viewBox={`0 0 ${w} 70`}
        style={{ display: "block", marginLeft: -30, marginTop: -55 }}
      >
        <path
          d={`M0 40 Q${w * 0.15} 55 ${w * 0.3} 35 Q${w * 0.45} 15 ${w * 0.6} 40 Q${w * 0.75} 60 ${w * 0.9} 30 Q${w * 0.97} 10 ${w} 38 L${w} 0 L0 0 Z`}
          fill={colors[1]}
        />
      </svg>

      {/* Wave 3 - lightest, fastest */}
      <svg
        className="animate-wave-drift-1"
        width={w}
        height={60}
        viewBox={`0 0 ${w} 60`}
        style={{ display: "block", marginLeft: -30, marginTop: -45 }}
      >
        <path
          d={`M0 30 Q${w * 0.12} 50 ${w * 0.28} 28 Q${w * 0.42} 10 ${w * 0.58} 35 Q${w * 0.72} 55 ${w * 0.88} 25 Q${w * 0.96} 8 ${w} 30 L${w} 0 L0 0 Z`}
          fill={colors[2]}
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CLOUDS - soft drifting cloud clusters near the top
   ───────────────────────────────────────────────────────────────────────── */
function Clouds({ isReef }: { isReef: boolean }) {
  const opacity = isReef ? 0.18 : 0.14;

  return (
    <>
      {/* Cloud 1 - large, top left */}
      <svg
        className="absolute animate-cloud-drift-1"
        style={{ top: 12, left: -20 }}
        width={220}
        height={70}
        viewBox="0 0 220 70"
      >
        <defs>
          <radialGradient id="wc1" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" stopOpacity={1} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={70} cy={40} rx={60} ry={26} fill="url(#wc1)" opacity={opacity} />
        <ellipse cx={120} cy={32} rx={68} ry={30} fill="url(#wc1)" opacity={opacity * 1.2} />
        <ellipse cx={172} cy={42} rx={48} ry={24} fill="url(#wc1)" opacity={opacity * 0.8} />
      </svg>

      {/* Cloud 2 - medium, top right */}
      <svg
        className="absolute animate-cloud-drift-2"
        style={{ top: 30, right: -10 }}
        width={190}
        height={60}
        viewBox="0 0 190 60"
      >
        <defs>
          <radialGradient id="wc2" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" stopOpacity={1} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={55} cy={35} rx={48} ry={22} fill="url(#wc2)" opacity={opacity * 0.9} />
        <ellipse cx={105} cy={28} rx={58} ry={26} fill="url(#wc2)" opacity={opacity * 1.1} />
        <ellipse cx={152} cy={38} rx={42} ry={20} fill="url(#wc2)" opacity={opacity * 0.7} />
      </svg>

      {/* Cloud 3 - small wispy, center */}
      <svg
        className="absolute animate-cloud-drift-3"
        style={{ top: 60, left: "25%" }}
        width={150}
        height={50}
        viewBox="0 0 150 50"
      >
        <defs>
          <radialGradient id="wc3" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" stopOpacity={1} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={40} cy={28} rx={38} ry={16} fill="url(#wc3)" opacity={opacity * 0.7} />
        <ellipse cx={82} cy={22} rx={44} ry={20} fill="url(#wc3)" opacity={opacity} />
        <ellipse cx={120} cy={30} rx={34} ry={14} fill="url(#wc3)" opacity={opacity * 0.6} />
      </svg>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FLOATING BUBBLES - extra animated bubbles scattered through the page
   ───────────────────────────────────────────────────────────────────────── */
function FloatingBubbles({ isReef }: { isReef: boolean }) {
  const color = isReef ? "rgba(8,145,178,0.5)" : "rgba(5,150,105,0.5)";
  const highlight = isReef ? "rgba(6,182,212,0.3)" : "rgba(16,185,129,0.3)";

  const bubbles = [
    { size: 12, left: "8%", bottom: "12%", delay: "0s", dur: "7s" },
    { size: 18, left: "22%", bottom: "35%", delay: "1.5s", dur: "9s" },
    { size: 10, left: "38%", bottom: "55%", delay: "3s", dur: "8s" },
    { size: 15, left: "55%", bottom: "18%", delay: "0.5s", dur: "6.5s" },
    { size: 20, left: "70%", bottom: "42%", delay: "2s", dur: "10s" },
    { size: 8, left: "85%", bottom: "28%", delay: "4s", dur: "7.5s" },
    { size: 14, left: "92%", bottom: "60%", delay: "1s", dur: "8.5s" },
  ];

  return (
    <>
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-bubble-rise"
          style={{
            width: b.size,
            height: b.size,
            left: b.left,
            bottom: b.bottom,
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), ${color})`,
            border: `1px solid ${highlight}`,
            animationDelay: b.delay,
            animationDuration: b.dur,
          }}
        />
      ))}
    </>
  );
}
