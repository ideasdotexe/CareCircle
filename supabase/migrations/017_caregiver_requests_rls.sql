-- ═══════════════════════════════════════════════════════════════════════
-- 017 · caregiver_requests — create table if missing, set correct RLS
--
-- The caregiver_requests table was created outside the migration chain.
-- This migration ensures it exists with the correct structure and RLS
-- so both owners and caregivers can interact with it properly.
-- Run once in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════

-- Create table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS caregiver_requests (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_name      TEXT        NOT NULL DEFAULT '',
  caregiver_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  caregiver_email TEXT        NOT NULL DEFAULT '',
  role            TEXT        NOT NULL DEFAULT 'Family',
  status          TEXT        NOT NULL DEFAULT 'pending',
  permissions     JSONB       NOT NULL DEFAULT '{}',
  person_id       UUID        REFERENCES persons(id) ON DELETE SET NULL,
  message         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, caregiver_email)
);

ALTER TABLE caregiver_requests ENABLE ROW LEVEL SECURITY;

-- ── Owner policies ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "caregiver_requests_owner" ON caregiver_requests;
CREATE POLICY "caregiver_requests_owner"
  ON caregiver_requests FOR ALL
  USING (auth.uid() = owner_id);

-- ── Caregiver read policy ───────────────────────────────────────────────
-- Caregivers can read requests sent to them (by caregiver_id or by email)
DROP POLICY IF EXISTS "caregiver_requests_caregiver_read" ON caregiver_requests;
CREATE POLICY "caregiver_requests_caregiver_read"
  ON caregiver_requests FOR SELECT
  USING (
    auth.uid() = caregiver_id
    OR caregiver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ── Caregiver update policy ─────────────────────────────────────────────
-- Caregivers can accept/decline requests and set their caregiver_id
DROP POLICY IF EXISTS "caregiver_requests_caregiver_update" ON caregiver_requests;
CREATE POLICY "caregiver_requests_caregiver_update"
  ON caregiver_requests FOR UPDATE
  USING (
    auth.uid() = caregiver_id
    OR caregiver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = caregiver_id
    OR caregiver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ── Also ensure caregiver_relationships has correct RLS ─────────────────
-- (safe to run again if migration 003 already ran)
ALTER TABLE IF EXISTS caregiver_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "caregiver_relationships_access" ON caregiver_relationships;
CREATE POLICY "caregiver_relationships_access"
  ON caregiver_relationships FOR ALL
  USING (auth.uid() = profile_owner_id OR auth.uid() = caregiver_id);
