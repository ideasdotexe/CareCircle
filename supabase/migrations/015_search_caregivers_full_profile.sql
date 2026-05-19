-- Drop first — Postgres won't let CREATE OR REPLACE change the return type.
DROP FUNCTION IF EXISTS search_caregivers(TEXT);

-- Update search_caregivers to return full professional profile fields
-- added in migration 014. Without this the Find-a-Caregiver screen only
-- sees id/full_name/email and none of the bio/title/rate/etc. that caregivers fill in.

CREATE OR REPLACE FUNCTION search_caregivers(p_query TEXT)
RETURNS TABLE (
  id           UUID,
  full_name    TEXT,
  email        TEXT,
  title        TEXT,
  years_exp    INTEGER,
  bio          TEXT,
  available    TEXT,
  city         TEXT,
  region       TEXT,
  province     TEXT,
  rate         TEXT,
  specialties  TEXT[],
  languages    TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  trimmed TEXT := lower(trim(p_query));
BEGIN
  IF trimmed = '' THEN
    RETURN QUERY
      SELECT
        p.id, p.full_name, p.email,
        p.title, p.years_exp,
        p.bio, p.available,
        p.city, p.region, p.province,
        p.rate, p.specialties, p.languages
      FROM   profiles p
      WHERE  p.role = 'caregiver'
        AND  p.id <> auth.uid()
      ORDER BY p.full_name
      LIMIT 50;
  ELSE
    RETURN QUERY
      SELECT
        p.id, p.full_name, p.email,
        p.title, p.years_exp,
        p.bio, p.available,
        p.city, p.region, p.province,
        p.rate, p.specialties, p.languages
      FROM   profiles p
      WHERE  p.role = 'caregiver'
        AND  p.id <> auth.uid()
        AND (
          lower(p.full_name)  LIKE '%' || trimmed || '%'
          OR lower(p.email)   LIKE '%' || trimmed || '%'
          OR lower(p.city)    LIKE '%' || trimmed || '%'
          OR lower(p.title)   LIKE '%' || trimmed || '%'
          OR lower(p.bio)     LIKE '%' || trimmed || '%'
          OR p.specialties::TEXT ILIKE '%' || trimmed || '%'
          OR p.languages::TEXT  ILIKE '%' || trimmed || '%'
        )
      ORDER BY
        CASE WHEN lower(p.email) = trimmed THEN 0 ELSE 1 END,
        p.full_name
      LIMIT 30;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION search_caregivers TO authenticated;
