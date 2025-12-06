-- ReefXOne Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTH
-- ============================================================================
-- Note: Supabase Auth handles the auth.users table automatically
-- We extend it with a profiles table for additional user data

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'super-premium');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired', 'past_due');

CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tier subscription_tier DEFAULT 'free' NOT NULL,
  status subscription_status DEFAULT 'active' NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  storage_used_mb DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  storage_limit_mb INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================================================
-- TANKS (Multi-tank support for Super Premium)
-- ============================================================================
CREATE TABLE public.tanks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Main Tank',
  size_gallons DECIMAL(10, 2),
  type TEXT, -- e.g., 'reef', 'fowlr', 'nano'
  setup_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- REEF PARAMETER LOGS
-- ============================================================================
CREATE TABLE public.reef_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tank_id UUID REFERENCES public.tanks(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  temp DECIMAL(5, 2),
  salinity DECIMAL(5, 3),
  alk DECIMAL(5, 2),
  ph DECIMAL(4, 2),
  cal INT,
  mag INT,
  po4 DECIMAL(5, 3),
  no3 DECIMAL(6, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, tank_id, log_date)
);

-- Index for faster queries
CREATE INDEX idx_reef_logs_user_date ON public.reef_logs(user_id, log_date DESC);
CREATE INDEX idx_reef_logs_tank_date ON public.reef_logs(tank_id, log_date DESC);

-- ============================================================================
-- THRESHOLDS (User-defined parameter thresholds)
-- ============================================================================
CREATE TABLE public.thresholds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tank_id UUID REFERENCES public.tanks(id) ON DELETE CASCADE,
  parameter TEXT NOT NULL, -- 'temp', 'salinity', 'alk', etc.
  min_value DECIMAL(10, 3),
  max_value DECIMAL(10, 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, tank_id, parameter)
);

-- ============================================================================
-- MAINTENANCE ENTRIES
-- ============================================================================
CREATE TYPE maintenance_status AS ENUM ('pending', 'completed', 'overdue');

CREATE TABLE public.maintenance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tank_id UUID REFERENCES public.tanks(id) ON DELETE CASCADE NOT NULL,
  task TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_date DATE,
  status maintenance_status DEFAULT 'pending' NOT NULL,
  repeat_interval INT, -- in days, null for one-time tasks
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_maintenance_user_status ON public.maintenance(user_id, status, due_date);
CREATE INDEX idx_maintenance_tank_status ON public.maintenance(tank_id, status, due_date);

-- ============================================================================
-- EQUIPMENT (Super Premium feature)
-- ============================================================================
CREATE TYPE equipment_category AS ENUM ('lighting', 'filtration', 'heating', 'controller', 'pump', 'skimmer', 'other');
CREATE TYPE equipment_status AS ENUM ('active', 'inactive', 'maintenance');

CREATE TABLE public.equipment (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tank_id UUID REFERENCES public.tanks(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category equipment_category NOT NULL,
  brand TEXT,
  model TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  warranty_expires DATE,
  status equipment_status DEFAULT 'active' NOT NULL,
  last_maintenance DATE,
  next_maintenance DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_equipment_user_tank ON public.equipment(user_id, tank_id);

-- ============================================================================
-- LIVESTOCK (Super Premium feature)
-- ============================================================================
CREATE TYPE livestock_type AS ENUM ('fish', 'coral', 'invert');
CREATE TYPE livestock_status AS ENUM ('healthy', 'quarantine', 'sick', 'deceased');
CREATE TYPE temperament AS ENUM ('peaceful', 'semi-aggressive', 'aggressive');

CREATE TABLE public.livestock (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tank_id UUID REFERENCES public.tanks(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type livestock_type NOT NULL,
  species TEXT,
  scientific_name TEXT,
  date_added DATE NOT NULL,
  source TEXT,
  cost DECIMAL(10, 2),
  status livestock_status DEFAULT 'healthy' NOT NULL,
  size TEXT,
  temperament temperament,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_livestock_user_tank ON public.livestock(user_id, tank_id);
CREATE INDEX idx_livestock_type_status ON public.livestock(type, status);

-- ============================================================================
-- GALLERY PHOTOS (Premium/Super Premium feature)
-- ============================================================================
CREATE TABLE public.gallery_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tank_id UUID REFERENCES public.tanks(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  caption TEXT,
  tags TEXT[], -- Array of tags
  file_size_bytes BIGINT NOT NULL,
  photo_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_gallery_user_tank ON public.gallery_photos(user_id, tank_id, photo_date DESC);
CREATE INDEX idx_gallery_tags ON public.gallery_photos USING GIN(tags);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reef_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: Users can only see their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Tanks: Users can manage their own tanks
CREATE POLICY "Users can view own tanks" ON public.tanks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tanks" ON public.tanks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tanks" ON public.tanks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tanks" ON public.tanks
  FOR DELETE USING (auth.uid() = user_id);

-- Reef Logs: Users can manage their own logs
CREATE POLICY "Users can view own reef logs" ON public.reef_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reef logs" ON public.reef_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reef logs" ON public.reef_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reef logs" ON public.reef_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Thresholds: Users can manage their own thresholds
CREATE POLICY "Users can view own thresholds" ON public.thresholds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own thresholds" ON public.thresholds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thresholds" ON public.thresholds
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own thresholds" ON public.thresholds
  FOR DELETE USING (auth.uid() = user_id);

-- Maintenance: Users can manage their own maintenance
CREATE POLICY "Users can view own maintenance" ON public.maintenance
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own maintenance" ON public.maintenance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own maintenance" ON public.maintenance
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own maintenance" ON public.maintenance
  FOR DELETE USING (auth.uid() = user_id);

-- Equipment: Users can manage their own equipment
CREATE POLICY "Users can view own equipment" ON public.equipment
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment" ON public.equipment
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment" ON public.equipment
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment" ON public.equipment
  FOR DELETE USING (auth.uid() = user_id);

-- Livestock: Users can manage their own livestock
CREATE POLICY "Users can view own livestock" ON public.livestock
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own livestock" ON public.livestock
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own livestock" ON public.livestock
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own livestock" ON public.livestock
  FOR DELETE USING (auth.uid() = user_id);

-- Gallery Photos: Users can manage their own photos
CREATE POLICY "Users can view own photos" ON public.gallery_photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON public.gallery_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON public.gallery_photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON public.gallery_photos
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tanks_updated_at BEFORE UPDATE ON public.tanks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reef_logs_updated_at BEFORE UPDATE ON public.reef_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thresholds_updated_at BEFORE UPDATE ON public.thresholds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON public.maintenance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_livestock_updated_at BEFORE UPDATE ON public.livestock
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_photos_updated_at BEFORE UPDATE ON public.gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default tank and subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Reefer')
  );

  -- Create default tank
  INSERT INTO public.tanks (user_id, name)
  VALUES (NEW.id, 'Main Tank');

  -- Create free subscription
  INSERT INTO public.subscriptions (user_id, tier, storage_limit_mb)
  VALUES (NEW.id, 'free', 0);

  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to handle new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Run these commands in Supabase Dashboard > Storage or via SQL

-- Create gallery photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', false);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own photos
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'gallery' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
