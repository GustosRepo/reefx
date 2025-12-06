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
    success: "from-green-900/90 to-green-800/90 border-green-500/50",
    error: "from-red-900/90 to-red-800/90 border-red-500/50",
    info: "from-cyan-900/90 to-blue-800/90 border-cyan-500/50",
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
        className={`bg-gradient-to-r ${bgColor[type]} border rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
              type === "success"
                ? "bg-green-500"
                : type === "error"
                ? "bg-red-500"
                : "bg-cyan-500"
            }`}
          >
            {icon[type]}
          </div>
          <p className="text-white text-sm font-medium flex-1">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white/70 hover:text-white transition text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
