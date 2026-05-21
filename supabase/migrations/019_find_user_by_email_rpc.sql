-- ═══════════════════════════════════════════════════════════════════════
-- 019 · find_user_by_email — SECURITY DEFINER RPC
--
-- Looks up a user's UUID directly from auth.users by email.
-- More reliable than search_caregiver_by_email (no role filter required).
-- Used by the owner portal to resolve caregiver_id when it's missing
-- on caregiver_requests rows (e.g. accepted before the id-backfill fix).
-- Run once in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION find_user_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM auth.users WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
$$;

REVOKE ALL ON FUNCTION find_user_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION find_user_by_email(TEXT) TO authenticated;
