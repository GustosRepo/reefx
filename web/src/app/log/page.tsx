"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ReefForm, FieldErrors } from "@/types";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser, User } from "@/utils/auth";
import { normalizeTemperature, type TempUnit } from "@/utils/conversions";
import { useTank } from "@/context/TankContext";

export default function LogPage() {
  return (
    <ProtectedRoute>
      <LogPageContent />
    </ProtectedRoute>
  );
}

function LogPageContent() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { currentTank } = useTank();
  
  // Initialize with today's date
  const todayDateObj = new Date();
  todayDateObj.setHours(0, 0, 0, 0);
  const year = todayDateObj.getFullYear();
  const month = (todayDateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = todayDateObj.getDate().toString().padStart(2, "0");
  const todayString = `${year}-${month}-${day}`;

  const [form, setForm] = useState<ReefForm>({
    date: todayString,
    temp: "",
    alk: "",
    ph: "",
    cal: "",
    mag: "",
    po4: "",
    no3: "",
    salinity: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const isNumber = (val: string) => {
    const n = parseFloat(val);
    return !isNaN(n) && isFinite(n) && n >= 0;
  };

  useEffect(() => {
    const newErrors: FieldErrors = {};

    // Validate date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      newErrors.date = "Use format YYYY-MM-DD";
    } else {
      const [y, m, d] = form.date.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setHours(0, 0, 0, 0);
      if (isNaN(dt.getTime())) {
        newErrors.date = "Invalid date";
      } else if (dt.getTime() > todayDateObj.getTime()) {
        newErrors.date = "Date cannot be in the future";
      }
    }

    // Validate numeric fields
    (Object.keys(form) as (keyof ReefForm)[]).forEach((key) => {
      if (key !== "date") {
        const val = String(form[key]);
        if (val.trim() !== "" && !isNumber(val)) {
          newErrors[key] = "Enter a valid number ≥ 0";
        }
      }
    });

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || isSubmitting) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize temperature to Fahrenheit for storage
      let temp = form.temp;
      if (form.temp && user) {
        const tempValue = parseFloat(String(form.temp));
        temp = normalizeTemperature(tempValue, user.temp_unit).toString();
      }

      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          temp,
          salinity: form.salinity || null,
          alk: form.alk || null,
          ph: form.ph || null,
          cal: form.cal || null,
          mag: form.mag || null,
          po4: form.po4 || null,
          no3: form.no3 || null,
          tank_id: currentTank?.id || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save log');
      }

      // Show success animation
      setShowSuccess(true);
      toast.success("Log saved successfully!");
      
      // Reset form after animation
      setTimeout(() => {
        setForm({
          date: todayString,
          temp: "",
          alk: "",
          ph: "",
          cal: "",
          mag: "",
          po4: "",
          no3: "",
          salinity: "",
        });
        setShowSuccess(false);
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Failed to save log:", err);
      toast.error("Failed to save log");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parameter icons for visual enhancement
  const paramIcons: Record<string, string> = {
    temp: '🌡️',
    salinity: '🧂',
    alk: '⚗️',
    ph: '📊',
    cal: '💎',
    mag: '🔮',
    po4: '🧪',
    no3: '🌿',
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-gradient gradient-animate mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Log Parameters
        </motion.h1>
        
        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <motion.div 
                  className="text-8xl mb-4"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5 }}
                >
                  ✅
                </motion.div>
                <p className="text-2xl font-bold text-white">Saved!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div 
            className="glass-card rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Date Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-cyan-400 mb-2">
                📅 Date (YYYY-MM-DD)
              </label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              <AnimatePresence>
                {errors.date && (
                  <motion.p 
                    className="text-red-400 text-sm mt-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    {errors.date}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Parameter Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { 
                  key: "temp", 
                  label: `Temperature (${user?.temp_unit === 'celsius' ? '°C' : '°F'})`, 
                  placeholder: user?.temp_unit === 'celsius' ? "e.g., 25.5" : "e.g., 78" 
                },
                { key: "salinity", label: "Salinity (ppt)", placeholder: "e.g., 35" },
                { key: "alk", label: "Alkalinity (dKH)", placeholder: "e.g., 8.5" },
                { key: "ph", label: "pH", placeholder: "e.g., 8.2" },
                { key: "cal", label: "Calcium (ppm)", placeholder: "e.g., 420" },
                { key: "mag", label: "Magnesium (ppm)", placeholder: "e.g., 1350" },
                { key: "po4", label: "Phosphate (PO₄)", placeholder: "e.g., 0.05" },
                { key: "no3", label: "Nitrate (NO₃)", placeholder: "e.g., 5" },
              ].map(({ key, label, placeholder }, i) => (
                <motion.div 
                  key={key} 
                  className="mb-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <label className="block text-sm font-semibold text-cyan-400 mb-2">
                    {paramIcons[key]} {label}
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={form[key as keyof ReefForm]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  <AnimatePresence>
                    {errors[key] && (
                      <motion.p 
                        className="text-red-400 text-sm mt-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        {errors[key]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div 
            className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`flex-1 py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                isValid && !isSubmitting
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white glow-cyan"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
              whileHover={isValid ? { scale: 1.02 } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Log'
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition text-base sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </motion.div>
        </form>
      </div>
    </AppLayout>
  );
}
