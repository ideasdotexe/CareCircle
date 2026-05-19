-- ═══════════════════════════════════════════════════════════════════════
-- 009 · Caregiver data-access RLS
-- Adds read/write policies so caregivers can read persons, medications,
-- vitals, and visit_notes for people they're assigned to.
-- Run this in the Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════

-- ─── persons: caregivers can read persons they're assigned to ────────────
-- Drop the old owner-only policy first to replace it cleanly.
DROP POLICY IF EXISTS "persons_owner_access" ON persons;
DROP POLICY IF EXISTS "persons_access"       ON persons;

CREATE POLICY "persons_owner_access"
  ON persons FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "persons_caregiver_read"
  ON persons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = persons.id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
    )
  );

-- ─── medications: caregivers with medications.visible can read ──────────
-- (Don't drop existing owner policy — just add the caregiver SELECT policy)
DROP POLICY IF EXISTS "medications_caregiver_read" ON medications;

CREATE POLICY "medications_caregiver_read"
  ON medications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = medications.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND (cr.permissions -> 'medications' ->> 'visible')::boolean = TRUE
    )
  );

-- ─── vitals: caregivers with vitals.visible can read ────────────────────
DROP POLICY IF EXISTS "vitals_caregiver_read"   ON vitals;
DROP POLICY IF EXISTS "vitals_caregiver_insert" ON vitals;

CREATE POLICY "vitals_caregiver_read"
  ON vitals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = vitals.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND (cr.permissions -> 'vitals' ->> 'visible')::boolean = TRUE
    )
  );

CREATE POLICY "vitals_caregiver_insert"
  ON vitals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = vitals.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND (cr.permissions -> 'vitals' ->> 'contribute')::boolean = TRUE
    )
  );

-- ─── visit_notes: caregiver INSERT (contribute) ──────────────────────────
-- SELECT is already covered by 003. Add INSERT policy.
DROP POLICY IF EXISTS "visit_notes_caregiver_insert" ON visit_notes;

CREATE POLICY "visit_notes_caregiver_insert"
  ON visit_notes FOR INSERT
  WITH CHECK (
    auth.uid() = logged_by_id
    AND EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = visit_notes.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND (cr.permissions -> 'visit_notes' ->> 'contribute')::boolean = TRUE
    )
  );

-- ─── allergies: caregivers with allergies.visible can read ─────────────
-- Only run this if the allergies table exists in your schema.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'allergies' AND table_schema = 'public') THEN
    EXECUTE $policy$
      DROP POLICY IF EXISTS "allergies_caregiver_read" ON allergies;
      CREATE POLICY "allergies_caregiver_read"
        ON allergies FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM caregiver_relationships cr
            WHERE cr.person_id = allergies.person_id
              AND cr.caregiver_id = auth.uid()
              AND cr.access_revoked = FALSE
              AND (cr.permissions -> 'allergies' ->> 'visible')::boolean = TRUE
          )
        );
    $policy$;
  END IF;
END $$;
