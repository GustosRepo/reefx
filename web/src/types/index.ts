// Type definitions for the ReefX application

export interface ReefForm {
  date: string;
  temp: string | number;
  alk: string | number;
  ph: string | number;
  cal: string | number;
  mag: string | number;
  po4: string | number;
  no3: string | number;
  salinity: string | number;
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
