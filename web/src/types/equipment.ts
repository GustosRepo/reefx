// Equipment tracking types
export interface Equipment {
  id: string;
  tankId: string;
  name: string;
  category: "lighting" | "filtration" | "heating" | "controller" | "pump" | "skimmer" | "other";
  brand?: string;
  model?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpires?: string;
  notes?: string;
  status: "active" | "inactive" | "maintenance";
  lastMaintenance?: string;
  nextMaintenance?: string;
}

export type EquipmentCategory = Equipment["category"];
