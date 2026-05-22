-- ═══════════════════════════════════════════════════════════════════════
-- 020 · medication_logs — caregiver marks meds taken/skipped
-- Run once in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS medication_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id        UUID        NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  medication_name  TEXT        NOT NULL,
  scheduled_time   TEXT,
  log_date         DATE        NOT NULL,
  status           TEXT        NOT NULL CHECK (status IN ('taken', 'skipped')),
  note             TEXT,
  logged_by        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  logged_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (person_id, medication_name, log_date, scheduled_time)
);

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- Owner of the person + assigned caregiver can read and write
CREATE POLICY "medication_logs_access"
  ON medication_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = medication_logs.person_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = medication_logs.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
    )
  );
