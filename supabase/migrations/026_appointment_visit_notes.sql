-- ═══════════════════════════════════════════════════════════════════════
-- 026 · Visit notes on appointments
-- Adds visited_at timestamp + structured post-visit notes
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS visited_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visit_notes         TEXT,
  ADD COLUMN IF NOT EXISTS prescriptions_noted TEXT,
  ADD COLUMN IF NOT EXISTS tests_ordered       TEXT;
