// Type definitions for AquaXone Mobile
// Shared with web app

// Combined form supporting both reef and freshwater parameters
export interface ReefForm {
  date: string;
  temp: string | number;
  // Shared parameters
  ph: string | number;
  po4: string | number;
  no3: string | number;
  // Reef/Saltwater specific
  alk: string | number;
  cal: string | number;
  mag: string | number;
  salinity: string | number;
  // Freshwater specific
  gh: string | number;
  kh: string | number;
  ammonia: string | number;
  no2: string | number;
}

export interface MaintenanceEntry {
  id?: string;
  due_date: string;
  task: string;
  description?: string;
  cost?: number;
  repeat_interval?: string;
  status?: 'pending' | 'completed' | 'skipped';
  completed_date?: string;
  tank_id?: string;
  user_id?: string;
  created_at?: string;
}

export interface Tank {
  id: string;
  name: string;
  size_gallons?: number;
  type?: 'reef' | 'freshwater' | 'fowlr' | 'nano';
  setup_date?: string;
  notes?: string;
  is_active?: boolean;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
  is_admin?: boolean;
}

export interface ParameterLog {
  id: string;
  tank_id: string;
  user_id: string;
  log_date: string;
  temp?: number;
  ph?: number;
  salinity?: number;
  alk?: number;
  cal?: number;
  mag?: number;
  no3?: number;
  po4?: number;
  gh?: number;
  kh?: number;
  ammonia?: number;
  no2?: number;
  notes?: string;
  created_at: string;
}

export interface EquipmentItem {
  id: string;
  tank_id: string;
  user_id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  purchase_price?: number;
  purchase_date?: string;
  warranty_expires?: string;
  status?: 'active' | 'maintenance' | 'retired';
  last_maintenance?: string;
  next_maintenance?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface LivestockItem {
  id: string;
  tank_id: string;
  user_id: string;
  name: string;
  species?: string;
  scientific_name?: string;
  type: 'fish' | 'coral' | 'invert' | 'invertebrate' | 'plant' | 'other';
  date_added: string;
  source?: string;
  cost?: number;
  status: 'healthy' | 'quarantine' | 'sick' | 'deceased';
  size?: string;
  temperament?: 'peaceful' | 'semi-aggressive' | 'aggressive';
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface GalleryImage {
  id: string;
  tank_id?: string | null;
  user_id: string;
  storage_path: string;
  url: string;
  caption?: string;
  tags?: string[];
  file_size_mb?: number;
  file_size_bytes?: number;
  photo_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface Subscription {
  tier: 'free' | 'premium' | 'super-premium';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export interface Threshold {
  id: string;
  tank_id: string;
  parameter: string;
  min_value?: number;
  max_value?: number;
  created_at: string;
}

export interface FieldErrors {
  [key: string]: string;
}

// Navigation types
export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'login': undefined;
  'register': undefined;
  'forgot-password': undefined;
};

export type TabParamList = {
  index: undefined;
  log: undefined;
  history: undefined;
  maintenance: undefined;
  more: undefined;
};

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
