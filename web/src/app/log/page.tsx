"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ReefForm, FieldErrors } from "@/types";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser, User } from "@/utils/auth";
import { normalizeTemperature, type TempUnit } from "@/utils/conversions";

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
    
    if (!isValid) {
      toast.error("Please fix the errors before submitting");
      return;
    }

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
          tank_id: null, // Will add tank selection later
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save log');
      }

      toast.success("Log saved successfully!");
      
      // Reset form
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
      
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save log:", err);
      toast.error("Failed to save log");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gradient mb-6">Log Parameters</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            {/* Date Field */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-cyan-400 mb-2">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500"
              />
              {errors.date && (
                <p className="text-red-400 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            {/* Parameter Fields */}
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
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-semibold text-cyan-400 mb-2">
                  {label}
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
                  className="w-full bg-gray-950 border border-gray-600 rounded px-4 py-3 text-white text-base focus:outline-none focus:border-cyan-500"
                />
                {errors[key] && (
                  <p className="text-red-400 text-sm mt-1">{errors[key]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="submit"
              disabled={!isValid}
              className={`flex-1 py-4 rounded-lg font-semibold text-base transition-all duration-200 ${
                isValid
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white active:from-cyan-600 active:to-blue-600 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Save Log
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-6 py-4 bg-gray-700 text-white rounded-lg active:bg-gray-600 transition text-base sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
