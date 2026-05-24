-- ═══════════════════════════════════════════════════════════════════════
-- 029 · SECURITY DEFINER RPC to insert caregiver requests
-- Bypasses RLS entirely — no more 403 on insert.
-- ═══════════════════════════════════════════════════════════════════════

-- Re-ensure table exists with correct schema
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

ALTER TABLE caregiver_requests ENABLE ROW LEVEL SECURITY;

-- Drop all old policies and recreate cleanly
DROP POLICY IF EXISTS "caregiver_requests_owner"            ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_owner_select"     ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_owner_insert"     ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_owner_update"     ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_owner_delete"     ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_caregiver_read"   ON caregiver_requests;
DROP POLICY IF EXISTS "caregiver_requests_caregiver_update" ON caregiver_requests;
DROP POLICY IF EXISTS "cr_owner_all"                        ON caregiver_requests;
DROP POLICY IF EXISTS "cr_caregiver_read"                   ON caregiver_requests;
DROP POLICY IF EXISTS "cr_caregiver_update"                 ON caregiver_requests;

CREATE POLICY "cr_owner_all"
  ON caregiver_requests FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "cr_caregiver_read"
  ON caregiver_requests FOR SELECT
  USING (
    auth.uid() = caregiver_id
    OR LOWER(caregiver_email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "cr_caregiver_update"
  ON caregiver_requests FOR UPDATE
  USING (
    auth.uid() = caregiver_id
    OR LOWER(caregiver_email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    auth.uid() = caregiver_id
    OR LOWER(caregiver_email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- ── SECURITY DEFINER insert function — bypasses RLS ───────────────────
CREATE OR REPLACE FUNCTION send_care_request(
  p_caregiver_email TEXT,
  p_owner_name      TEXT,
  p_role            TEXT,
  p_permissions     JSONB,
  p_person_id       UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id     UUID := auth.uid();
  v_caregiver_id UUID := NULL;
  v_id           UUID;
BEGIN
  -- Must be authenticated
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Look up caregiver by email (auth.users is accessible inside SECURITY DEFINER)
  SELECT id INTO v_caregiver_id
  FROM auth.users
  WHERE LOWER(email) = LOWER(TRIM(p_caregiver_email))
  LIMIT 1;

  -- Remove any old rejected / cancelled rows for this email so re-invite works
  DELETE FROM caregiver_requests
  WHERE owner_id = v_owner_id
    AND LOWER(caregiver_email) = LOWER(TRIM(p_caregiver_email))
    AND status IN ('rejected', 'cancelled');

  -- Block if already pending or accepted
  IF EXISTS (
    SELECT 1 FROM caregiver_requests
    WHERE owner_id = v_owner_id
      AND LOWER(caregiver_email) = LOWER(TRIM(p_caregiver_email))
      AND status IN ('pending', 'accepted')
  ) THEN
    RAISE EXCEPTION 'already_exists';
  END IF;

  -- Insert
  INSERT INTO caregiver_requests (
    owner_id, owner_name, caregiver_id, caregiver_email,
    role, status, permissions, person_id
  )
  VALUES (
    v_owner_id,
    p_owner_name,
    v_caregiver_id,
    LOWER(TRIM(p_caregiver_email)),
    p_role,
    'pending',
    p_permissions,
    p_person_id
  )
  RETURNING id INTO v_id;

  RETURN json_build_object(
    'id',           v_id,
    'caregiver_id', v_caregiver_id
  );
END;
$$;

REVOKE ALL ON FUNCTION send_care_request(TEXT, TEXT, TEXT, JSONB, UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION send_care_request(TEXT, TEXT, TEXT, JSONB, UUID) TO authenticated;

-- ── get_caregiver_requests RPC (already exists, recreate safely) ──────
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
