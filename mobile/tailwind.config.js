/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // AquaXone Brand Colors
        aqua: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Background colors
        background: {
          DEFAULT: '#b8dfe9',
          secondary: '#a8d4e0',
        },
        // Reef mode colors
        reef: {
          cyan: '#0891b2',
          teal: '#0d9488',
          ocean: '#0369a1',
          coral: '#f97316',
          anemone: '#ec4899',
          purple: '#8b5cf6',
          surface: '#e0f2fe',
          deep: '#0c4a6e',
        },
        // Freshwater mode colors
        fresh: {
          emerald: '#059669',
          green: '#22c55e',
          teal: '#14b8a6',
          aqua: '#06b6d4',
          lime: '#84cc16',
          nature: '#15803d',
          surface: '#ecfdf5',
          deep: '#064e3b',
        },
        // Parameter colors
        param: {
          temp: '#f97316',
          salinity: '#3b82f6',
          alk: '#8b5cf6',
          ph: '#10b981',
          cal: '#06b6d4',
          mag: '#ec4899',
          po4: '#f59e0b',
          no3: '#ef4444',
          gh: '#6366f1',
          kh: '#8b5cf6',
          ammonia: '#dc2626',
          nitrite: '#ea580c',
          co2: '#22c55e',
          iron: '#b45309',
        },
        // Status colors
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
