-- Add unit preference columns to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN temp_unit TEXT DEFAULT 'fahrenheit' CHECK (temp_unit IN ('fahrenheit', 'celsius')),
ADD COLUMN volume_unit TEXT DEFAULT 'gallons' CHECK (volume_unit IN ('gallons', 'liters'));

-- Update existing users to have default values
UPDATE public.profiles 
SET temp_unit = 'fahrenheit', volume_unit = 'gallons' 
WHERE temp_unit IS NULL OR volume_unit IS NULL;
