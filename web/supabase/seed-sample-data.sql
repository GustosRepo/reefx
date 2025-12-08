-- ReefX Sample Data Seed Script
-- Run this in Supabase SQL Editor
-- It will create sample data for the currently authenticated user

-- First, let's get your user_id
-- Replace 'YOUR_EMAIL_HERE' with your actual email
DO $$
DECLARE
  v_user_id UUID;
  v_tank_id UUID;
BEGIN
  -- Get user ID from profiles (or auth.users)
  -- IMPORTANT: Replace 'your-email@example.com' with YOUR actual email address!
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'test123@gmail.com';
  
  -- If you don't know your email, run this query first to see all users:
  -- SELECT id, email FROM auth.users;
  
  RAISE NOTICE 'Using user_id: %', v_user_id;

  -- Create a tank
  INSERT INTO tanks (user_id, name, size_gallons, type, setup_date, notes, is_active)
  VALUES (v_user_id, 'Main Reef Tank', 75, 'reef', '2024-01-15', 'Mixed reef with LPS and SPS corals', true)
  RETURNING id INTO v_tank_id;
  
  RAISE NOTICE 'Created tank_id: %', v_tank_id;

  -- Add reef parameter logs
  INSERT INTO reef_logs (user_id, tank_id, log_date, temp, salinity, ph, alk, cal, mag, po4, no3)
  VALUES 
    (v_user_id, v_tank_id, '2024-12-01', 77.5, 1.025, 8.2, 8.5, 420, 1350, 0.03, 5),
    (v_user_id, v_tank_id, '2024-12-04', 78.0, 1.025, 8.1, 8.2, 410, 1340, 0.05, 8),
    (v_user_id, v_tank_id, '2024-12-07', 77.8, 1.026, 8.3, 8.8, 430, 1360, 0.04, 6);

  -- Add maintenance entries
  INSERT INTO maintenance (user_id, tank_id, task, description, due_date, completed_date, status, repeat_interval)
  VALUES 
    (v_user_id, v_tank_id, 'Water Change', '10 gallon water change', '2024-12-07', '2024-12-07', 'completed', 7),
    (v_user_id, v_tank_id, 'Clean Protein Skimmer', 'Empty cup and clean neck', '2024-12-05', '2024-12-05', 'completed', 3),
    (v_user_id, v_tank_id, 'Replace Carbon', 'Change activated carbon in reactor', '2024-12-10', NULL, 'pending', 30),
    (v_user_id, v_tank_id, 'Clean Glass', 'Scrape algae and clean viewing panel', '2024-11-25', NULL, 'pending', 2);

  -- Add equipment
  INSERT INTO equipment (user_id, tank_id, name, category, brand, model, purchase_date, purchase_price, warranty_expires, status, notes)
  VALUES 
    (v_user_id, v_tank_id, 'AI Prime 16HD', 'lighting', 'Aqua Illumination', 'Prime 16HD', '2024-01-10', 249.99, '2025-01-10', 'active', 'Running at 60% intensity'),
    (v_user_id, v_tank_id, 'Reef Octopus Classic 110', 'filtration', 'Reef Octopus', 'Classic 110INT', '2024-01-15', 199.99, NULL, 'active', NULL),
    (v_user_id, v_tank_id, 'Eheim Jager 150W', 'heating', 'Eheim', 'Jager 3616', '2024-01-12', 34.99, '2026-01-12', 'active', NULL),
    (v_user_id, v_tank_id, 'MP40 QD', 'pump', 'EcoTech Marine', 'MP40wQD', '2024-02-01', 449.99, '2026-02-01', 'active', 'Running reef crest mode');

  -- Add livestock
  INSERT INTO livestock (user_id, tank_id, name, type, species, scientific_name, date_added, source, cost, status, size, temperament, notes)
  VALUES 
    (v_user_id, v_tank_id, 'Nemo', 'fish', 'Ocellaris Clownfish', 'Amphiprion ocellaris', '2024-02-15', 'Local Fish Store', 29.99, 'healthy', '2 inches', 'peaceful', 'Hosting in hammer coral'),
    (v_user_id, v_tank_id, 'Dory', 'fish', 'Yellow Tang', 'Zebrasoma flavescens', '2024-03-01', 'Online Retailer', 89.99, 'healthy', '3 inches', 'semi-aggressive', 'Very active grazer'),
    (v_user_id, v_tank_id, 'Emerald Crab', 'invert', 'Emerald Crab', 'Mithraculus sculptus', '2024-02-20', 'Local Fish Store', 12.99, 'healthy', NULL, 'peaceful', 'Great for bubble algae control'),
    (v_user_id, v_tank_id, 'Hammer Coral', 'coral', 'Hammer Coral', 'Euphyllia ancora', '2024-03-15', 'Coral Frag Swap', 45.00, 'healthy', '3 head colony', 'peaceful', 'Excellent extension and feeding response');

  RAISE NOTICE 'Sample data created successfully!';
END $$;
