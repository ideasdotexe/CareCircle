-- ═══════════════════════════════════════════════════════════════════════
-- 018 · get_caregiver_requests — SECURITY DEFINER RPC
--
-- Bypasses RLS on caregiver_requests so caregivers can fetch their own
-- pending requests even if the SELECT policy is missing.
-- Run once in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_caregiver_requests(
  p_email       TEXT,
  p_caregiver_id UUID
)
RETURNS SETOF caregiver_requests
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT *
  FROM caregiver_requests
  WHERE status = 'pending'
    AND (
      caregiver_id = p_caregiver_id
      OR LOWER(caregiver_email) = LOWER(p_email)
    )
  ORDER BY created_at DESC;
$$;

-- Only allow authenticated users to call this
REVOKE ALL ON FUNCTION get_caregiver_requests(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_caregiver_requests(TEXT, UUID) TO authenticated;
