-- ═══════════════════════════════════════════════════════════════════════
-- 027 · Fix caregiver invite flow
--
-- Problems fixed:
--   1. UNIQUE(owner_id, caregiver_email) blocks re-inviting after rejection
--      → replaced with partial unique index (only blocks pending/accepted)
--   2. caregiver_requests INSERT RLS had no explicit WITH CHECK clause
--      → added explicit INSERT policy
--   3. notifications INSERT policy used deprecated auth.role() check
--      → replaced with auth.uid() IS NOT NULL
--   4. person_id in caregiver_requests was implicitly NOT NULL in some envs
--      → explicitly drop NOT NULL
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Fix caregiver_requests unique constraint ───────────────────────
-- Drop the blanket unique constraint that blocks re-inviting rejected emails
ALTER TABLE caregiver_requests
  DROP CONSTRAINT IF EXISTS caregiver_requests_owner_id_caregiver_email_key;

-- Replace with a partial index: only one active (pending/accepted) request
-- per owner+email pair is allowed; rejected/cancelled rows are fine to co-exist
DROP INDEX IF EXISTS caregiver_requests_active_unique;
CREATE UNIQUE INDEX caregiver_requests_active_unique
  ON caregiver_requests (owner_id, caregiver_email)
  WHERE status IN ('pending', 'accepted');

-- ── 2. Make person_id explicitly nullable ─────────────────────────────
ALTER TABLE caregiver_requests
  ALTER COLUMN person_id DROP NOT NULL;

-- ── 3. Fix RLS — split FOR ALL into explicit per-operation policies ───
ALTER TABLE caregiver_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "caregiver_requests_owner"            ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_owner_select"     ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_owner_insert"     ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_owner_update"     ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_owner_delete"     ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_caregiver_read"   ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_caregiver_update" ON caregiver_requests;

-- Owner: read their own requests
CREATE POLICY "caregiver_requests_owner_select"
  ON caregiver_requests FOR SELECT
  USING (auth.uid() = owner_id);

-- Owner: insert new requests (explicit WITH CHECK)
CREATE POLICY "caregiver_requests_owner_insert"
  ON caregiver_requests FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owner: update/delete their own requests
CREATE POLICY "caregiver_requests_owner_update"
  ON caregiver_requests FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "caregiver_requests_owner_delete"
  ON caregiver_requests FOR DELETE
  USING (auth.uid() = owner_id);

-- Caregiver: read requests sent to them (by id or email)
CREATE POLICY "caregiver_requests_caregiver_read"
  ON caregiver_requests FOR SELECT
  USING (
    auth.uid() = caregiver_id
    OR LOWER(caregiver_email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Caregiver: accept or decline (update status, set caregiver_id)
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

-- ── 4. Fix notifications INSERT policy (auth.role() is deprecated) ───
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── 5. Ensure get_caregiver_requests RPC handles null caregiver_id ───
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

-- ── 6. Clean up duplicate care_request notifications ─────────────────
-- Keep only the most recent care_request notification per user_id; delete the rest.
DELETE FROM notifications
WHERE type = 'care_request'
  AND id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM notifications
    WHERE type = 'care_request'
    ORDER BY user_id, created_at DESC
  );
