// Type definitions for the ReefX application

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
  date: string;
  type: string;
  notes?: string;
  cost?: string;
  repeatInterval?: number;
  overdue?: boolean;
}

export interface FieldErrors {
  [key: string]: string;
}
