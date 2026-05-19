-- ═══════════════════════════════════════════════════════════════════════
-- 008 · Connection request flow
--      caregiver_connections gains status + owner_name so caregivers
--      can see and respond to incoming connection requests.
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE caregiver_connections
  ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS owner_name TEXT NOT NULL DEFAULT '';

-- Existing rows were direct connects (pre-request-flow) — mark as accepted
UPDATE caregiver_connections SET status = 'accepted' WHERE status = 'pending';

-- ─── RLS additions ────────────────────────────────────────────────────────
-- Caregivers need to read requests sent to them and respond to them.
-- The existing "caregiver_connections_owner" policy only lets the owner act.

CREATE POLICY "caregiver_connections_caregiver_read"
  ON caregiver_connections FOR SELECT
  USING (auth.uid() = caregiver_id);

CREATE POLICY "caregiver_connections_caregiver_update"
  ON caregiver_connections FOR UPDATE
  USING  (auth.uid() = caregiver_id)
  WITH CHECK (auth.uid() = caregiver_id);
