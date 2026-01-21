"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAquaMode } from "@/context/AquaModeContext";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (tankData: OnboardingData) => void;
  userName?: string;
}

export interface OnboardingData {
  aquaMode: "reef" | "freshwater";
  tankName: string;
  tankSize: string;
  tankType: string;
}

const REEF_TYPES = [
  { value: "reef", label: "Reef Tank", icon: "🪸", desc: "Mixed reef with corals" },
  { value: "fowlr", label: "FOWLR", icon: "🐠", desc: "Fish only with live rock" },
  { value: "nano-reef", label: "Nano Reef", icon: "🐚", desc: "Small reef under 30 gal" },
  { value: "lagoon", label: "Lagoon", icon: "🏝️", desc: "Shallow sand bed, softies" },
];

const FRESHWATER_TYPES = [
  { value: "planted", label: "Planted Tank", icon: "🌿", desc: "Aquascaped with live plants" },
  { value: "community", label: "Community", icon: "🐟", desc: "Mixed peaceful species" },
  { value: "cichlid", label: "Cichlid", icon: "🐠", desc: "African or South American" },
  { value: "betta", label: "Betta", icon: "🪷", desc: "Betta splendens habitat" },
  { value: "shrimp", label: "Shrimp Tank", icon: "🦐", desc: "Caridina or Neocaridina" },
];

export default function OnboardingModal({ isOpen, onComplete, userName }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [aquaMode, setAquaMode] = useState<"reef" | "freshwater">("reef");
  const [tankName, setTankName] = useState("");
  const [tankSize, setTankSize] = useState("");
  const [tankType, setTankType] = useState("");
  const { setMode } = useAquaMode();

  const handleModeSelect = (mode: "reef" | "freshwater") => {
    setAquaMode(mode);
    setTankType(""); // Reset tank type when mode changes
    setMode(mode); // Set the global aqua mode
  };

  const handleComplete = () => {
    onComplete({
      aquaMode,
      tankName: tankName || (aquaMode === "reef" ? "My Reef Tank" : "My Freshwater Tank"),
      tankSize,
      tankType,
    });
  };

  const tankTypes = aquaMode === "reef" ? REEF_TYPES : FRESHWATER_TYPES;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Progress Bar */}
          <div className="h-1 bg-slate-100">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-6 md:p-8">
            {/* Step 1: Welcome & Mode Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    className="text-6xl mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    🫧
                  </motion.div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Welcome{userName ? `, ${userName}` : ""}! 🎉
                  </h2>
                  <p className="text-slate-500 mt-2">
                    Let's set up your first aquarium
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-slate-700 text-center">
                    What type of aquarium do you have?
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleModeSelect("reef")}
                      className={`p-5 rounded-xl border-2 transition-all text-left ${
                        aquaMode === "reef"
                          ? "border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-100"
                          : "border-slate-200 bg-slate-50 hover:border-cyan-300"
                      }`}
                    >
                      <div className="text-4xl mb-2">🪸</div>
                      <div className="font-bold text-slate-800">Reef / Saltwater</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Coral reefs, marine fish, invertebrates
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleModeSelect("freshwater")}
                      className={`p-5 rounded-xl border-2 transition-all text-left ${
                        aquaMode === "freshwater"
                          ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
                          : "border-slate-200 bg-slate-50 hover:border-emerald-300"
                      }`}
                    >
                      <div className="text-4xl mb-2">🌿</div>
                      <div className="font-bold text-slate-800">Freshwater</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Planted tanks, tropical fish, shrimp
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 transition"
                >
                  Continue →
                </button>
              </motion.div>
            )}

            {/* Step 2: Tank Type Selection */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">
                    {aquaMode === "reef" ? "🪸" : "🌿"}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    What type of {aquaMode === "reef" ? "saltwater" : "freshwater"} tank?
                  </h2>
                  <p className="text-slate-500 mt-1 text-sm">
                    This helps us show relevant tips and parameters
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {tankTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setTankType(type.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        tankType === type.value
                          ? aquaMode === "reef"
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="font-semibold text-slate-800 text-sm">{type.label}</div>
                      <div className="text-xs text-slate-500">{type.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!tankType}
                    className={`flex-1 py-3 rounded-xl font-semibold transition ${
                      tankType
                        ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Tank Name & Size */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🐠</div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Almost there!
                  </h2>
                  <p className="text-slate-500 mt-1 text-sm">
                    Give your tank a name and size
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tank Name
                    </label>
                    <input
                      type="text"
                      value={tankName}
                      onChange={(e) => setTankName(e.target.value)}
                      placeholder={aquaMode === "reef" ? "e.g., My Reef Tank" : "e.g., Living Room Aquarium"}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tank Size (gallons)
                    </label>
                    <input
                      type="number"
                      value={tankSize}
                      onChange={(e) => setTankSize(e.target.value)}
                      placeholder="e.g., 75"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleComplete}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-teal-600 transition"
                  >
                    🚀 Let's Go!
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
