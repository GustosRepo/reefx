// Livestock tracking types
export interface Livestock {
  id: string;
  tankId: string;
  tankName?: string;
  name: string;
  type: "fish" | "coral" | "invert";
  species?: string;
  scientificName?: string;
  dateAdded: string;
  source?: string;
  cost?: number;
  notes?: string;
  photoUrl?: string;
  status: "healthy" | "quarantine" | "sick" | "deceased";
  size?: string;
  temperament?: "peaceful" | "semi-aggressive" | "aggressive";
}

export type LivestockType = Livestock["type"];
export type LivestockStatus = Livestock["status"];
