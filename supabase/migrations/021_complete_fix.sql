-- ═══════════════════════════════════════════════════════════════════════
-- 021 · COMPLETE FIX — run this once in Supabase SQL Editor
-- Covers: caregiver_requests RLS, caregiver_relationships RLS,
--         medication_logs table, and all required RPC functions.
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. caregiver_requests RLS ────────────────────────────────────────────
ALTER TABLE caregiver_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "caregiver_requests_owner"           ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_caregiver_read"  ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_caregiver_update" ON caregiver_requests;

-- Owner: full access to their own rows
CREATE POLICY "caregiver_requests_owner"
  ON caregiver_requests FOR ALL
  USING (auth.uid() = owner_id);

-- Caregiver: can read rows sent to them (by id or email)
CREATE POLICY "caregiver_requests_caregiver_read"
  ON caregiver_requests FOR SELECT
  USING (
    auth.uid() = caregiver_id
    OR LOWER(caregiver_email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Caregiver: can update (accept/decline) rows sent to them
CREATE POLICY "caregiver_requests_caregiver_update"
  ON caregiver_requests FOR UPDATE
  USING (
    auth.uid() = caregiver_id
    OR LOWER(caregiver_email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    auth.uid() = caregiver_id
    OR LOWER(caregiver_email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- ── 2. caregiver_relationships RLS ──────────────────────────────────────
ALTER TABLE caregiver_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "caregiver_relationships_access" ON caregiver_relationships;

CREATE POLICY "caregiver_relationships_access"
  ON caregiver_relationships FOR ALL
  USING (auth.uid() = profile_owner_id OR auth.uid() = caregiver_id);

-- ── 3. medication_logs table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medication_logs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id        UUID        NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  medication_name  TEXT        NOT NULL,
  scheduled_time   TEXT,
  log_date         DATE        NOT NULL,
  status           TEXT        NOT NULL CHECK (status IN ('taken', 'skipped')),
  note             TEXT,
  logged_by        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  logged_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Remove NOT NULL from logged_at if it exists (safe re-run)
ALTER TABLE medication_logs ALTER COLUMN logged_at DROP NOT NULL;
ALTER TABLE medication_logs ALTER COLUMN logged_at SET DEFAULT NOW();

-- Unique constraint for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'medication_logs_unique'
  ) THEN
    ALTER TABLE medication_logs
      ADD CONSTRAINT medication_logs_unique
      UNIQUE NULLS NOT DISTINCT (person_id, medication_name, log_date, scheduled_time);
  END IF;
END $$;

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "medication_logs_access" ON medication_logs;

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

-- ── 4. RPC: get_caregiver_requests (bypasses caregiver_requests RLS) ────
CREATE OR REPLACE FUNCTION get_caregiver_requests(
  p_email        TEXT,
  p_caregiver_id UUID
)
RETURNS SETOF caregiver_requests
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM caregiver_requests
  WHERE status = 'pending'
    AND (
      caregiver_id = p_caregiver_id
      OR LOWER(caregiver_email) = LOWER(p_email)
    )
  ORDER BY created_at DESC;
$$;

REVOKE ALL ON FUNCTION get_caregiver_requests(TEXT, UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_caregiver_requests(TEXT, UUID) TO authenticated;

-- ── 5. RPC: find_user_by_email (owner uses to resolve caregiver UUID) ───
CREATE OR REPLACE FUNCTION find_user_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM auth.users WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
$$;

REVOKE ALL ON FUNCTION find_user_by_email(TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION find_user_by_email(TEXT) TO authenticated;
