-- ═══════════════════════════════════════════════════════════════════════
-- 011 · Add end_date column to medications
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE medications
  ADD COLUMN IF NOT EXISTS end_date TEXT;

-- Force PostgREST schema cache reload so the new column is visible immediately
NOTIFY pgrst, 'reload schema';
