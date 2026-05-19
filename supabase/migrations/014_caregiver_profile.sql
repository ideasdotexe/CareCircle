-- Caregiver professional profile fields
-- Stored on the shared `profiles` table so the search RPC can join them.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS title        TEXT,
  ADD COLUMN IF NOT EXISTS years_exp    INTEGER,
  ADD COLUMN IF NOT EXISTS bio          TEXT,
  ADD COLUMN IF NOT EXISTS available    TEXT,
  ADD COLUMN IF NOT EXISTS city         TEXT,
  ADD COLUMN IF NOT EXISTS region       TEXT,
  ADD COLUMN IF NOT EXISTS province     TEXT,
  ADD COLUMN IF NOT EXISTS rate         TEXT,
  ADD COLUMN IF NOT EXISTS specialties  TEXT[],
  ADD COLUMN IF NOT EXISTS languages    TEXT[];

-- Allow caregivers (and all authenticated users) to update their own row.
-- The existing RLS on profiles already allows SELECT for everyone and
-- INSERT/UPDATE for own row (id = auth.uid()), so no new policy is needed
-- unless that policy is restrictive — we add one defensively.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
      AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY profiles_update_own ON profiles
      FOR UPDATE
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END;
$$;
