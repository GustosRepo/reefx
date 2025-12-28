-- Add `is_admin` flag to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Mark an initial admin by email (change email if needed)
UPDATE public.profiles
SET is_admin = true
WHERE lower(email) = 'admin@code-wrx.com';

-- Optional: create an index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles (is_admin);
