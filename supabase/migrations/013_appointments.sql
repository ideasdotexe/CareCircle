-- ═══════════════════════════════════════════════════════════════════════
-- 013 · Appointments
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS appointments (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id         UUID        REFERENCES persons(id)    ON DELETE CASCADE NOT NULL,
  title             TEXT        NOT NULL,
  appointment_date  DATE        NOT NULL,
  appointment_time  TEXT,                    -- HH:MM 24-hour, nullable (all-day)
  appointment_type  TEXT        NOT NULL DEFAULT 'visit',
  -- 'visit' | 'lab' | 'imaging' | 'tele' | 'pharmacy' | 'dentist'
  provider          TEXT,
  location          TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_appointments_person_date
  ON appointments(person_id, appointment_date);

-- ─── Auto-update updated_at ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_appointments_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_appointments_timestamp();

-- ─── RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Profile owner can read/write their own persons' appointments
DROP POLICY IF EXISTS "appointments_owner" ON appointments;
CREATE POLICY "appointments_owner"
  ON appointments
  FOR ALL
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Caregivers can read appointments for persons they have active access to
DROP POLICY IF EXISTS "appointments_caregiver_read" ON appointments;
CREATE POLICY "appointments_caregiver_read"
  ON appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = appointments.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = false
    )
  );

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
