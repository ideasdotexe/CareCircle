-- ═══════════════════════════════════════════════════════════════════════
-- 012 · Medication schedules & dose logging
-- ═══════════════════════════════════════════════════════════════════════

-- ─── medication_schedules ───────────────────────────────────────────────
-- One row per scheduled medication per person.
-- times[] stores HH:00 strings (e.g. ['08:00', '20:00']).
CREATE TABLE IF NOT EXISTS medication_schedules (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id           UUID        REFERENCES persons(id)    ON DELETE CASCADE NOT NULL,
  medication_name     TEXT        NOT NULL,
  dose_quantity       TEXT,
  dose_unit           TEXT        NOT NULL DEFAULT 'tablet',
  frequency_type      TEXT        NOT NULL DEFAULT 'once_daily',
  -- 'once_daily' | 'twice_daily' | 'three_daily' | 'every_other_day' | 'custom_days' | 'prn'
  times               TEXT[]      NOT NULL DEFAULT ARRAY['08:00'],
  days_of_week        TEXT[],     -- only used when frequency_type = 'custom_days'
  food_instruction    TEXT,       -- 'with_food' | 'without_food' | 'with_water' | null
  supply_on_hand      INTEGER,
  supply_updated_at   TIMESTAMPTZ,
  start_date          DATE,
  active              BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── medication_dose_logs ───────────────────────────────────────────────
-- One row per dose taken / skipped / missed.
CREATE TABLE IF NOT EXISTS medication_dose_logs (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id         UUID        REFERENCES medication_schedules(id) ON DELETE CASCADE NOT NULL,
  person_id           UUID        REFERENCES persons(id)              ON DELETE CASCADE NOT NULL,
  scheduled_time      TIMESTAMPTZ NOT NULL,  -- ISO timestamp of when this dose was due
  status              TEXT        NOT NULL DEFAULT 'taken',
  -- 'taken' | 'taken_late' | 'skipped' | 'missed'
  confirmed_by_id     UUID        REFERENCES auth.users(id),
  confirmed_by_name   TEXT,
  confirmed_by_role   TEXT,       -- 'family' | 'caregiver'
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_med_schedules_person  ON medication_schedules(person_id) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_dose_logs_person_date ON medication_dose_logs(person_id, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_dose_logs_schedule    ON medication_dose_logs(schedule_id);

-- ─── RLS ────────────────────────────────────────────────────────────────
ALTER TABLE medication_schedules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_dose_logs  ENABLE ROW LEVEL SECURITY;

-- Schedules: owner of the profile can read/write
DROP POLICY IF EXISTS "schedules_owner" ON medication_schedules;
CREATE POLICY "schedules_owner"
  ON medication_schedules
  FOR ALL
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Dose logs: any user who owns a schedule can log against it
DROP POLICY IF EXISTS "dose_logs_owner" ON medication_dose_logs;
CREATE POLICY "dose_logs_owner"
  ON medication_dose_logs
  FOR ALL
  USING  (
    EXISTS (
      SELECT 1 FROM medication_schedules s
      WHERE s.id = medication_dose_logs.schedule_id
        AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medication_schedules s
      WHERE s.id = medication_dose_logs.schedule_id
        AND s.user_id = auth.uid()
    )
  );

-- Auto-update updated_at on schedule changes
CREATE OR REPLACE FUNCTION update_medication_schedule_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_med_schedule_updated_at ON medication_schedules;
CREATE TRIGGER trg_med_schedule_updated_at
  BEFORE UPDATE ON medication_schedules
  FOR EACH ROW EXECUTE FUNCTION update_medication_schedule_timestamp();

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
