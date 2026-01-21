"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-[var(--aqua-accent-primary)]/10 border-[var(--aqua-accent-primary)]/30",
  };

  const textColor = {
    success: "text-green-800",
    error: "text-red-800",
    info: "text-[var(--aqua-accent-primary)]",
  };

  const icon = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <div
        className={`${bgColor[type]} border rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
              type === "success"
                ? "bg-green-500"
                : type === "error"
                ? "bg-red-500"
                : "bg-[var(--aqua-accent-primary)]"
            }`}
          >
            {icon[type]}
          </div>
          <p className={`${textColor[type]} text-sm font-medium flex-1`}>{message}</p>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-slate-400 hover:text-slate-600 transition text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
