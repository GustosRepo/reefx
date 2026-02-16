/**
 * AquaXone App Constants
 */

export const APP_NAME = 'AquaXone';
export const APP_TAGLINE = 'Smart Aquarium Tracking';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'aquaxone_auth_token',
  USER_DATA: 'aquaxone_user_data',
  CURRENT_TANK: 'aquaxone_current_tank',
  AQUA_MODE: 'aquaxone_mode',
  ONBOARDING_COMPLETE: 'aquaxone_onboarding_complete',
  ALERTS_MUTED: 'aquaxone_alerts_muted',
  MAINTENANCE_MUTED: 'aquaxone_maintenance_muted',
  PUSH_TOKEN: 'aquaxone_push_token',
  UNIT_PREFERENCES: 'aquaxone_unit_preferences',
  NOTIFICATION_SETTINGS: 'aquaxone_notification_settings',
} as const;

// API endpoints (relative to your Supabase/API)
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/callback',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  RESET_PASSWORD: '/auth/reset-password',

  // Tanks
  TANKS: '/api/tanks',

  // Logs
  LOGS: '/api/logs',

  // Maintenance
  MAINTENANCE: '/api/maintenance',

  // Equipment
  EQUIPMENT: '/api/equipment',

  // Livestock
  LIVESTOCK: '/api/livestock',

  // Gallery
  GALLERY: '/api/gallery',

  // Thresholds
  THRESHOLDS: '/api/thresholds',

  // Subscription
  SUBSCRIPTION: '/api/subscription',
} as const;

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  SUPER_PREMIUM: 'super-premium',
} as const;

// Feature flags by tier
export const TIER_FEATURES = {
  free: {
    maxTanks: 1,
    gallery: false,
    equipment: false,
    livestock: false,
    exportData: false,
    customThresholds: false,
    adsEnabled: true,
  },
  premium: {
    maxTanks: 3,
    gallery: true,
    equipment: false,
    livestock: false,
    exportData: true,
    customThresholds: true,
    adsEnabled: false,
  },
  'super-premium': {
    maxTanks: 5,
    gallery: true,
    equipment: true,
    livestock: true,
    exportData: true,
    customThresholds: true,
    adsEnabled: false,
  },
} as const;

// Reef mode parameters
export const REEF_PARAMETERS = [
  { key: 'temp', label: 'Temperature', unit: '°F', icon: '🌡️', color: '#f97316' },
  { key: 'salinity', label: 'Salinity', unit: 'ppt', icon: '🧂', color: '#3b82f6' },
  { key: 'ph', label: 'pH', unit: '', icon: '⚗️', color: '#10b981' },
  { key: 'alk', label: 'Alkalinity', unit: 'dKH', icon: '📊', color: '#8b5cf6' },
  { key: 'cal', label: 'Calcium', unit: 'ppm', icon: 'ite', color: '#06b6d4' },
  { key: 'mag', label: 'Magnesium', unit: 'ppm', icon: '🔮', color: '#ec4899' },
  { key: 'no3', label: 'Nitrate', unit: 'ppm', icon: '🔴', color: '#ef4444' },
  { key: 'po4', label: 'Phosphate', unit: 'ppm', icon: '🟡', color: '#f59e0b' },
] as const;

// Freshwater mode parameters
export const FRESHWATER_PARAMETERS = [
  { key: 'temp', label: 'Temperature', unit: '°F', icon: '🌡️', color: '#f97316' },
  { key: 'ph', label: 'pH', unit: '', icon: '⚗️', color: '#10b981' },
  { key: 'gh', label: 'GH', unit: 'dGH', icon: '💎', color: '#6366f1' },
  { key: 'kh', label: 'KH', unit: 'dKH', icon: '📊', color: '#8b5cf6' },
  { key: 'ammonia', label: 'Ammonia', unit: 'ppm', icon: '⚠️', color: '#dc2626' },
  { key: 'no2', label: 'Nitrite', unit: 'ppm', icon: '🟠', color: '#ea580c' },
  { key: 'no3', label: 'Nitrate', unit: 'ppm', icon: '🔴', color: '#ef4444' },
  { key: 'po4', label: 'Phosphate', unit: 'ppm', icon: '🟡', color: '#f59e0b' },
] as const;

// Maintenance types
export const MAINTENANCE_TYPES = [
  { value: 'water_change', label: 'Water Change', icon: '💧' },
  { value: 'filter_clean', label: 'Filter Clean', icon: '🔧' },
  { value: 'glass_clean', label: 'Glass Clean', icon: '✨' },
  { value: 'dose_alk', label: 'Dose Alkalinity', icon: '📊' },
  { value: 'dose_cal', label: 'Dose Calcium', icon: '💎' },
  { value: 'dose_mag', label: 'Dose Magnesium', icon: '🔮' },
  { value: 'feed', label: 'Feed', icon: '🍽️' },
  { value: 'equipment_check', label: 'Equipment Check', icon: '🛠️' },
  { value: 'other', label: 'Other', icon: '📝' },
] as const;
