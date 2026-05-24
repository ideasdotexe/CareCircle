-- ═══════════════════════════════════════════════════════════════════════
-- 024 · Caregiver RLS fix — run once in Supabase SQL Editor
--
-- Problems fixed:
--  1. All old policies checked permissions->>'visible' but the app stores
--     permissions->>'view'. Policies now accept either key.
--  2. Empty permissions {} (set when caregiver accepts a FindCaregiver
--     request before the owner assigns them) are treated as full access.
--  3. Missing policies: appointments, lab_results, conditions, allergies,
--     medication_schedules, conditions.
-- ═══════════════════════════════════════════════════════════════════════

-- Helper: returns TRUE when a caregiver has 'view' or 'visible' on a section,
-- OR when permissions is empty/null (owner hasn't customised = full access).
-- Usage: caregiver_can_view(cr.permissions, 'medications')
CREATE OR REPLACE FUNCTION caregiver_can_view(perms JSONB, section TEXT)
RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$
  SELECT
    perms IS NULL
    OR perms = '{}'::jsonb
    OR (perms -> section ->> 'view')::boolean = TRUE
    OR (perms -> section ->> 'visible')::boolean = TRUE;
$$;

CREATE OR REPLACE FUNCTION caregiver_can_contribute(perms JSONB, section TEXT)
RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$
  SELECT
    perms IS NULL
    OR perms = '{}'::jsonb
    OR (perms -> section ->> 'contribute')::boolean = TRUE;
$$;

-- ── persons ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "persons_caregiver_read" ON persons;
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

-- ── medications ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "medications_caregiver_read" ON medications;
CREATE POLICY "medications_caregiver_read"
  ON medications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = medications.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND caregiver_can_view(cr.permissions, 'medications')
    )
  );

DROP POLICY IF EXISTS "medications_caregiver_write" ON medications;
CREATE POLICY "medications_caregiver_write"
  ON medications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = medications.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND caregiver_can_contribute(cr.permissions, 'medications')
    )
  );

-- ── medication_schedules ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "med_schedules_caregiver_read" ON medication_schedules;
CREATE POLICY "med_schedules_caregiver_read"
  ON medication_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = medication_schedules.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND caregiver_can_view(cr.permissions, 'medications')
    )
  );

-- ── vitals ────────────────────────────────────────────────────────────────
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
        AND caregiver_can_view(cr.permissions, 'vitals')
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
        AND caregiver_can_contribute(cr.permissions, 'vitals')
    )
  );

-- ── appointments ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "appointments_caregiver_read"  ON appointments;
DROP POLICY IF EXISTS "appointments_caregiver_write" ON appointments;

CREATE POLICY "appointments_caregiver_read"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = appointments.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND caregiver_can_view(cr.permissions, 'appointments')
    )
  );

CREATE POLICY "appointments_caregiver_write"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = appointments.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND caregiver_can_contribute(cr.permissions, 'appointments')
    )
  );

-- ── activity_log ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "activity_log_access" ON activity_log;
CREATE POLICY "activity_log_access"
  ON activity_log FOR ALL
  USING (
    auth.uid() = actor_id
    OR EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = activity_log.person_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = activity_log.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND caregiver_can_view(cr.permissions, 'activity')
    )
  );

-- ── lab_results (documents) ───────────────────────────────────────────────
DROP POLICY IF EXISTS "lab_results_caregiver_read"  ON lab_results;
DROP POLICY IF EXISTS "lab_results_caregiver_write" ON lab_results;

CREATE POLICY "lab_results_caregiver_read"
  ON lab_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = lab_results.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND caregiver_can_view(cr.permissions, 'reports')
    )
  );

CREATE POLICY "lab_results_caregiver_write"
  ON lab_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = lab_results.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND caregiver_can_contribute(cr.permissions, 'reports')
    )
  );

-- ── conditions ────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conditions' AND table_schema = 'public') THEN
    EXECUTE $p$
      DROP POLICY IF EXISTS "conditions_caregiver_read" ON conditions;
      CREATE POLICY "conditions_caregiver_read"
        ON conditions FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM caregiver_relationships cr
            WHERE cr.person_id = conditions.person_id
              AND cr.caregiver_id = auth.uid()
              AND cr.access_revoked = FALSE
              AND caregiver_can_view(cr.permissions, 'profile')
          )
        );
    $p$;
  END IF;
END $$;

-- ── allergies ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'allergies' AND table_schema = 'public') THEN
    EXECUTE $p$
      DROP POLICY IF EXISTS "allergies_caregiver_read" ON allergies;
      CREATE POLICY "allergies_caregiver_read"
        ON allergies FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM caregiver_relationships cr
            WHERE cr.person_id = allergies.person_id
              AND cr.caregiver_id = auth.uid()
              AND cr.access_revoked = FALSE
              AND caregiver_can_view(cr.permissions, 'profile')
          )
        );
    $p$;
  END IF;
END $$;

-- ── emergency_contacts ────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'emergency_contacts' AND table_schema = 'public') THEN
    EXECUTE $p$
      DROP POLICY IF EXISTS "emergency_contacts_caregiver_read" ON emergency_contacts;
      CREATE POLICY "emergency_contacts_caregiver_read"
        ON emergency_contacts FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM caregiver_relationships cr
            WHERE cr.person_id = emergency_contacts.person_id
              AND cr.caregiver_id = auth.uid()
              AND cr.access_revoked = FALSE
              AND caregiver_can_view(cr.permissions, 'profile')
          )
        );
    $p$;
  END IF;
END $$;
