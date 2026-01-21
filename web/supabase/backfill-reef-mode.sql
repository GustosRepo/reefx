-- Backfill existing tanks with aqua_mode = 'reef'
-- All users who signed up for ReefXOne before the AquaXOne rebrand are assumed to have saltwater/reef tanks

-- Update all tanks that have NULL aqua_mode to 'reef'
UPDATE tanks
SET aqua_mode = 'reef'
WHERE aqua_mode IS NULL;

-- Also update any existing reef_logs that don't have a mode set
UPDATE reef_logs
SET mode = 'reef'
WHERE mode IS NULL;

-- Set default value for future tanks (if not already set)
ALTER TABLE tanks 
ALTER COLUMN aqua_mode SET DEFAULT 'reef';

-- Verify the update
SELECT 
  'tanks' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN aqua_mode = 'reef' THEN 1 END) as reef_count,
  COUNT(CASE WHEN aqua_mode = 'freshwater' THEN 1 END) as freshwater_count,
  COUNT(CASE WHEN aqua_mode IS NULL THEN 1 END) as null_count
FROM tanks
UNION ALL
SELECT 
  'reef_logs' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN mode = 'reef' THEN 1 END) as reef_count,
  COUNT(CASE WHEN mode = 'freshwater' THEN 1 END) as freshwater_count,
  COUNT(CASE WHEN mode IS NULL THEN 1 END) as null_count
FROM reef_logs;
