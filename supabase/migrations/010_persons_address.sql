-- ═══════════════════════════════════════════════════════════════════════
-- 010 · Add address column to persons
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE persons
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Force PostgREST schema cache reload so the new column is visible immediately
NOTIFY pgrst, 'reload schema';
