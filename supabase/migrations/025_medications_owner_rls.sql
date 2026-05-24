-- ═══════════════════════════════════════════════════════════════════════
-- 025 · Owner UPDATE and DELETE policies for medications table
-- Without these, Supabase silently returns 0 rows affected when
-- an owner tries to update active=false or delete a medication.
-- ═══════════════════════════════════════════════════════════════════════

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Drop and recreate owner policies (idempotent)
DROP POLICY IF EXISTS "medications_owner_all"    ON medications;
DROP POLICY IF EXISTS "medications_owner_read"   ON medications;
DROP POLICY IF EXISTS "medications_owner_insert" ON medications;
DROP POLICY IF EXISTS "medications_owner_update" ON medications;
DROP POLICY IF EXISTS "medications_owner_delete" ON medications;

-- Owner: full access to medications belonging to their persons
CREATE POLICY "medications_owner_all"
  ON medications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = medications.person_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = medications.person_id
        AND p.user_id = auth.uid()
    )
  );
