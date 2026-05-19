-- ═══════════════════════════════════════════════════════════════════════
-- 007 · Caregiver connections — owner-level relationship before person assignment
-- ═══════════════════════════════════════════════════════════════════════

-- Owner ↔ caregiver connection (not person-specific).
-- Created when owner taps "Connect" in the Care marketplace.
-- Used to assign the caregiver to a person later.
CREATE TABLE IF NOT EXISTS caregiver_connections (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  caregiver_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  caregiver_name  TEXT        NOT NULL DEFAULT '',
  caregiver_email TEXT        NOT NULL DEFAULT '',
  connected_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, caregiver_id)
);

ALTER TABLE caregiver_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "caregiver_connections_owner"
  ON caregiver_connections FOR ALL
  USING (auth.uid() = owner_id);

-- ─── RPC: search_caregivers ──────────────────────────────────────────────
-- Returns caregiver profiles matching a name or email query.
-- Empty query returns all caregivers (up to 30) for the browse view.
-- SECURITY DEFINER bypasses per-row RLS — only role='caregiver' rows returned.
CREATE OR REPLACE FUNCTION search_caregivers(p_query TEXT)
RETURNS TABLE (id UUID, full_name TEXT, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  trimmed TEXT := lower(trim(p_query));
BEGIN
  IF trimmed = '' THEN
    RETURN QUERY
      SELECT p.id, p.full_name, p.email
      FROM   profiles p
      WHERE  p.role = 'caregiver'
        AND  p.id <> auth.uid()
      ORDER BY p.full_name
      LIMIT 30;
  ELSE
    RETURN QUERY
      SELECT p.id, p.full_name, p.email
      FROM   profiles p
      WHERE  p.role = 'caregiver'
        AND  p.id <> auth.uid()
        AND (
          lower(p.full_name) LIKE '%' || trimmed || '%'
          OR lower(p.email)  LIKE '%' || trimmed || '%'
        )
      ORDER BY
        -- exact email match first, then name match
        CASE WHEN lower(p.email) = trimmed THEN 0 ELSE 1 END,
        p.full_name
      LIMIT 20;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION search_caregivers TO authenticated;
