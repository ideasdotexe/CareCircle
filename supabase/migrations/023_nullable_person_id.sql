-- 023 · Make person_id nullable in caregiver_relationships
--
-- Caregivers accepted from FindCaregiver have no person assigned yet.
-- The owner assigns them to a dear one from the Care screen.
-- Run once in Supabase SQL Editor.

ALTER TABLE caregiver_relationships
  ALTER COLUMN person_id DROP NOT NULL;
