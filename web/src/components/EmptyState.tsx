"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: "default" | "coral" | "fish" | "water";
}

// Animated coral reef SVG illustration
function CoralIllustration() {
  return (
    <motion.svg
      width="200"
      height="120"
      viewBox="0 0 200 120"
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Water background */}
      <defs>
        <linearGradient id="water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0891b2" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="coral1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
        <linearGradient id="coral2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="coral3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      
      {/* Sand */}
      <ellipse cx="100" cy="115" rx="90" ry="8" fill="#fde047" opacity="0.3" />
      
      {/* Coral 1 - branching */}
      <motion.g
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ transformOrigin: "60px 120px" }}
      >
        <path d="M60 120 L60 80 L50 60 M60 80 L70 55 M60 90 L45 75" stroke="url(#coral1)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="50" cy="55" r="6" fill="#f472b6" />
        <circle cx="70" cy="50" r="5" fill="#fb7185" />
        <circle cx="45" cy="70" r="4" fill="#fda4af" />
      </motion.g>
      
      {/* Coral 2 - brain coral */}
      <motion.g
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ transformOrigin: "100px 100px" }}
      >
        <ellipse cx="100" cy="95" rx="25" ry="20" fill="url(#coral2)" />
        <path d="M80 95 Q90 85 100 95 Q110 105 120 95" stroke="#fecdd3" strokeWidth="2" fill="none" />
        <path d="M85 100 Q95 90 105 100 Q115 110 125 100" stroke="#fecdd3" strokeWidth="1.5" fill="none" opacity="0.7" />
      </motion.g>
      
      {/* Coral 3 - fan coral */}
      <motion.g
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 5, repeat: Infinity }}
        style={{ transformOrigin: "150px 120px" }}
      >
        <path d="M150 120 L150 70" stroke="url(#coral3)" strokeWidth="4" />
        <path d="M150 70 Q130 50 140 30" stroke="#a78bfa" strokeWidth="2" fill="none" />
        <path d="M150 70 Q160 45 155 25" stroke="#c4b5fd" strokeWidth="2" fill="none" />
        <path d="M150 70 Q170 55 175 35" stroke="#a78bfa" strokeWidth="2" fill="none" />
      </motion.g>
      
      {/* Bubbles */}
      <motion.circle
        cx="40"
        cy="40"
        r="4"
        fill="#06b6d4"
        opacity="0.4"
        animate={{ y: [0, -30, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.circle
        cx="160"
        cy="50"
        r="3"
        fill="#22d3ee"
        opacity="0.3"
        animate={{ y: [0, -25, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      />
      <motion.circle
        cx="120"
        cy="30"
        r="2"
        fill="#67e8f9"
        opacity="0.5"
        animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
    </motion.svg>
  );
}

// Animated fish SVG
function FishIllustration() {
  return (
    <motion.svg
      width="200"
      height="100"
      viewBox="0 0 200 100"
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <defs>
        <linearGradient id="fish1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="fish2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      
      {/* Fish 1 - Clownfish */}
      <motion.g
        animate={{ x: [0, 20, 0], y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <ellipse cx="70" cy="50" rx="25" ry="15" fill="url(#fish1)" />
        <polygon points="95,50 115,35 115,65" fill="#fb923c" />
        <circle cx="55" cy="47" r="3" fill="#1e293b" />
        <path d="M45 50 L60 50" stroke="white" strokeWidth="3" />
        <path d="M75 50 L90 50" stroke="white" strokeWidth="3" />
      </motion.g>
      
      {/* Fish 2 - Blue tang */}
      <motion.g
        animate={{ x: [0, -15, 0], y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      >
        <ellipse cx="140" cy="60" rx="20" ry="12" fill="url(#fish2)" />
        <polygon points="160,60 175,50 175,70" fill="#2563eb" />
        <circle cx="128" cy="58" r="2" fill="#1e293b" />
        <path d="M135 65 Q145 70 155 65" stroke="#fcd34d" strokeWidth="2" fill="none" />
      </motion.g>
    </motion.svg>
  );
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const Illustration = variant === "coral" ? CoralIllustration : variant === "fish" ? FishIllustration : null;
  
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center py-12 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {Illustration && <Illustration />}
      
      {icon && !Illustration && (
        <motion.div
          className="text-6xl mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {icon}
        </motion.div>
      )}
      
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 max-w-md mb-6">{description}</p>
      
      {(actionLabel && actionHref) && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
        >
          {actionLabel}
        </Link>
      )}
      
      {(actionLabel && onAction) && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
