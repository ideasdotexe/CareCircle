-- ═══════════════════════════════════════════════════════════════════════
-- 028 · Fresh caregiver_requests table
-- Run AFTER dropping the old table in Supabase dashboard:
--   DROP TABLE IF EXISTS caregiver_requests CASCADE;
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS caregiver_requests (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name      TEXT        NOT NULL DEFAULT '',
  caregiver_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  caregiver_email TEXT        NOT NULL,
  role            TEXT        NOT NULL DEFAULT 'Family',
  status          TEXT        NOT NULL DEFAULT 'pending',
  permissions     JSONB       NOT NULL DEFAULT '{}',
  person_id       UUID        REFERENCES persons(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE caregiver_requests ENABLE ROW LEVEL SECURITY;

-- Owner: full read + write access to their own rows
CREATE POLICY "cr_owner_all"
  ON caregiver_requests
  FOR ALL
  USING  (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Caregiver: read requests sent to them (matched by user id OR email)
CREATE POLICY "cr_caregiver_read"
  ON caregiver_requests
  FOR SELECT
  USING (
    auth.uid() = caregiver_id
    OR LOWER(caregiver_email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Caregiver: accept / decline (update status only)
CREATE POLICY "cr_caregiver_update"
  ON caregiver_requests
  FOR UPDATE
  USING (
    auth.uid() = caregiver_id
    OR LOWER(caregiver_email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    auth.uid() = caregiver_id
    OR LOWER(caregiver_email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- ── RPC: fetch pending requests for a caregiver (bypasses RLS) ────────
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

-- ── Also fix notifications INSERT policy ─────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
