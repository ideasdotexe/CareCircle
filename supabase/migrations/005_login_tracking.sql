-- Track login history and onboarding state so we can distinguish
-- first-time users from returning ones, regardless of auth method.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS login_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean NOT NULL DEFAULT false;

-- Atomic login recorder — increments count and stamps last_login in one call.
-- Called from the app immediately after every successful auth (any method).
CREATE OR REPLACE FUNCTION public.record_login(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    last_login    = now(),
    login_count   = login_count + 1
  WHERE id = p_user_id;
END;
$$;
