"use client";

import { useAquaMode, MODE_CONFIG, AquaMode } from "@/context/AquaModeContext";
import { useState } from "react";

interface ModeSwitchProps {
  variant?: "compact" | "full" | "toggle";
  className?: string;
  showLabels?: boolean;
}

export default function ModeSwitch({
  variant = "toggle",
  className = "",
  showLabels = true,
}: ModeSwitchProps) {
  const { mode, setMode, toggleMode, modeIcon, modeLabel } = useAquaMode();
  const [isOpen, setIsOpen] = useState(false);

  // Toggle variant - simple switch
  if (variant === "toggle") {
    return (
      <button
        onClick={toggleMode}
        className={`
          relative inline-flex items-center gap-2 px-3 py-2 rounded-full
          bg-white border border-slate-200
          hover:border-[var(--aqua-accent-primary)] transition-all duration-300
          shadow-sm hover:shadow-md
          ${className}
        `}
        aria-label={`Switch to ${mode === "reef" ? "Freshwater" : "Reef"} Mode`}
      >
        {/* Mode indicator track */}
        <div className="relative w-14 h-7 bg-slate-100 rounded-full p-0.5">
          {/* Sliding indicator */}
          <div
            className={`
              absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300
              flex items-center justify-center text-sm
              ${mode === "reef"
                ? "left-0.5 bg-gradient-to-r from-cyan-500 to-teal-500"
                : "left-7 bg-gradient-to-r from-emerald-500 to-green-500"
              }
            `}
          >
            <span className="drop-shadow-sm">{modeIcon}</span>
          </div>
        </div>
        {showLabels && (
          <span className="text-sm font-medium text-slate-700 min-w-[90px]">
            {modeLabel}
          </span>
        )}
      </button>
    );
  }

  // Compact variant - dropdown style
  if (variant === "compact") {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            bg-white border border-slate-200
            hover:border-[var(--aqua-accent-primary)] transition-all
            shadow-sm
          `}
        >
          <span className="text-lg">{modeIcon}</span>
          <span className="text-sm font-medium text-slate-700">
            {MODE_CONFIG[mode].shortLabel}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-20 overflow-hidden">
              {(Object.keys(MODE_CONFIG) as AquaMode[]).map((modeKey) => (
                <button
                  key={modeKey}
                  onClick={() => {
                    setMode(modeKey);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    hover:bg-slate-50 transition-colors
                    ${mode === modeKey ? "bg-slate-50" : ""}
                  `}
                >
                  <span className="text-2xl">{MODE_CONFIG[modeKey].icon}</span>
                  <div>
                    <div className="font-medium text-slate-800">
                      {MODE_CONFIG[modeKey].label}
                    </div>
                    <div className="text-xs text-slate-500">
                      {MODE_CONFIG[modeKey].description}
                    </div>
                  </div>
                  {mode === modeKey && (
                    <svg className="w-5 h-5 text-[var(--aqua-accent-primary)] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full variant - side by side cards
  return (
    <div className={`flex gap-4 ${className}`}>
      {(Object.keys(MODE_CONFIG) as AquaMode[]).map((modeKey) => (
        <button
          key={modeKey}
          onClick={() => setMode(modeKey)}
          className={`
            flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl
            border-2 transition-all duration-300
            ${mode === modeKey
              ? modeKey === "reef"
                ? "border-cyan-500 bg-cyan-50"
                : "border-emerald-500 bg-emerald-50"
              : "border-slate-200 bg-white hover:border-slate-300"
            }
          `}
        >
          <span className="text-4xl">{MODE_CONFIG[modeKey].icon}</span>
          <div className="text-center">
            <div className="font-semibold text-slate-800">
              {MODE_CONFIG[modeKey].label}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {MODE_CONFIG[modeKey].description}
            </div>
          </div>
          {mode === modeKey && (
            <div
              className={`
                px-3 py-1 rounded-full text-xs font-medium text-white
                ${modeKey === "reef" ? "bg-cyan-500" : "bg-emerald-500"}
              `}
            >
              Active
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// Simpler inline mode indicator
export function ModeIndicator({ className = "" }: { className?: string }) {
  const { modeIcon, modeLabel, mode } = useAquaMode();

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${mode === "reef"
          ? "bg-cyan-100 text-cyan-700"
          : "bg-emerald-100 text-emerald-700"
        }
        ${className}
      `}
    >
      <span>{modeIcon}</span>
      <span>{modeLabel}</span>
    </div>
  );
}
