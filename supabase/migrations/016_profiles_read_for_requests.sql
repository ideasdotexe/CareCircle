-- ═══════════════════════════════════════════════════════════════════════
-- 016 · Allow caregivers to read basic profile info for request senders
-- Without this, caregiver_requests.owner_name was always blank for
-- requests created before the owner_name backfill in InviteCaregiverScreen.
-- Run this in the Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════

-- Enable RLS on profiles if not already enabled (safe to run twice)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read their own profile row
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
CREATE POLICY "profiles_read_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Allow caregivers to read the full_name of users who have sent them
-- a caregiver_request (pending or any status). Scoped to rows that are
-- actually the sender of a request to this caregiver.
DROP POLICY IF EXISTS "profiles_read_request_senders" ON profiles;
CREATE POLICY "profiles_read_request_senders"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregiver_requests cr
      WHERE cr.owner_id = profiles.id
        AND (
          cr.caregiver_id = auth.uid()
          OR cr.caregiver_email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
          )
        )
    )
  );
