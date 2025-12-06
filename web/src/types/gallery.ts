// Photo gallery types
export interface GalleryPhoto {
  id: string;
  tankId: string;
  url: string; // For demo, this will be a data URL. In production, use Supabase Storage URL
  caption: string;
  date: string;
  size: number; // in bytes
  tags?: string[];
  parameters?: {
    temp?: number;
    ph?: number;
    salinity?: number;
  };
}

export interface PhotoUpload {
  file: File;
  preview: string;
  caption: string;
  tags: string[];
}
