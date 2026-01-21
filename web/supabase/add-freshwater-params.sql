-- Migration: Add Freshwater Parameters to reef_logs
-- Run this in Supabase SQL Editor to support AquaXOne freshwater mode

-- ============================================================================
-- ADD FRESHWATER PARAMETERS TO REEF_LOGS TABLE
-- ============================================================================

-- Add freshwater-specific columns to the reef_logs table
ALTER TABLE public.reef_logs 
  ADD COLUMN IF NOT EXISTS gh DECIMAL(5, 2),           -- General Hardness (dGH)
  ADD COLUMN IF NOT EXISTS kh DECIMAL(5, 2),           -- Carbonate Hardness (dKH) - note: this is different from 'alk'
  ADD COLUMN IF NOT EXISTS ammonia DECIMAL(5, 3),      -- Ammonia (NH3/NH4) in ppm
  ADD COLUMN IF NOT EXISTS no2 DECIMAL(5, 3),          -- Nitrite (NO2) in ppm
  ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'reef';   -- 'reef' or 'freshwater' - track which mode was used

-- Add comment to clarify the table now supports both modes
COMMENT ON TABLE public.reef_logs IS 'Water parameter logs for both reef/saltwater and freshwater tanks (AquaXOne)';

-- Add comments on new columns
COMMENT ON COLUMN public.reef_logs.gh IS 'General Hardness in dGH (freshwater)';
COMMENT ON COLUMN public.reef_logs.kh IS 'Carbonate Hardness in dKH (freshwater) - separate from alk for reef';
COMMENT ON COLUMN public.reef_logs.ammonia IS 'Ammonia (NH3/NH4) in ppm (freshwater)';
COMMENT ON COLUMN public.reef_logs.no2 IS 'Nitrite (NO2) in ppm (freshwater)';
COMMENT ON COLUMN public.reef_logs.mode IS 'Aquarium mode: reef (saltwater) or freshwater';

-- ============================================================================
-- ADD FRESHWATER THRESHOLDS DEFAULTS
-- ============================================================================

-- You may want to insert default freshwater thresholds for new users
-- These are typical freshwater parameters ranges

-- Example default thresholds (uncomment and adjust as needed):
-- INSERT INTO public.thresholds (user_id, parameter, min_value, max_value)
-- SELECT id, 'gh', 4, 12 FROM public.profiles
-- ON CONFLICT (user_id, tank_id, parameter) DO NOTHING;

-- INSERT INTO public.thresholds (user_id, parameter, min_value, max_value)
-- SELECT id, 'kh', 3, 8 FROM public.profiles
-- ON CONFLICT (user_id, tank_id, parameter) DO NOTHING;

-- INSERT INTO public.thresholds (user_id, parameter, min_value, max_value)
-- SELECT id, 'ammonia', 0, 0.25 FROM public.profiles
-- ON CONFLICT (user_id, tank_id, parameter) DO NOTHING;

-- INSERT INTO public.thresholds (user_id, parameter, min_value, max_value)
-- SELECT id, 'no2', 0, 0.5 FROM public.profiles
-- ON CONFLICT (user_id, tank_id, parameter) DO NOTHING;

-- ============================================================================
-- UPDATE TANKS TABLE TO SUPPORT MODE
-- ============================================================================

-- Add mode column to tanks if you want to track tank type
ALTER TABLE public.tanks 
  ADD COLUMN IF NOT EXISTS aqua_mode TEXT DEFAULT 'reef';

COMMENT ON COLUMN public.tanks.aqua_mode IS 'Tank mode: reef (saltwater) or freshwater';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the columns were added:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'reef_logs' 
-- ORDER BY ordinal_position;
