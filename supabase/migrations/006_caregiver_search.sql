-- ═══════════════════════════════════════════════════════════════════════
-- 006 · Caregiver search — lookup by email so owners can connect directly
-- ═══════════════════════════════════════════════════════════════════════

-- Add email column to profiles so we can search caregivers by email
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill emails for existing users from auth.users
UPDATE profiles p
SET    email = u.email
FROM   auth.users u
WHERE  p.id = u.id
  AND  p.email IS NULL;

-- Keep email in sync on every new signup (replaces 004's trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, last_login, email)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'dear_one'),
    now(),
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN new;
END;
$$;

-- ─── RPC: search_caregiver_by_email ─────────────────────────────────────
-- Returns the profile of a registered caregiver matching the given email.
-- SECURITY DEFINER so it can read all profiles (bypasses per-row RLS).
-- Only returns rows where role = 'caregiver' — never exposes owner profiles.
CREATE OR REPLACE FUNCTION search_caregiver_by_email(p_email TEXT)
RETURNS TABLE (id UUID, full_name TEXT, role TEXT, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.role, p.email
  FROM   profiles p
  WHERE  lower(p.email) = lower(trim(p_email))
    AND  p.role = 'caregiver';
END;
$$;

GRANT EXECUTE ON FUNCTION search_caregiver_by_email TO authenticated;
