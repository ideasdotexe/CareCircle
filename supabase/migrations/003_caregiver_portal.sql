-- ═══════════════════════════════════════════════════════════════════════
-- 003 · Caregiver Portal — shared access & contribution layer
-- PRD: carecircle_caregiver_prd.md  |  May 2026
-- ═══════════════════════════════════════════════════════════════════════

-- ─── caregiver_relationships ────────────────────────────────────────────
-- One row per (caregiver, person) pair — holds role + section permissions.
CREATE TABLE IF NOT EXISTS caregiver_relationships (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_owner_id  UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  caregiver_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person_id         UUID        REFERENCES persons(id)    ON DELETE CASCADE NOT NULL,
  role              TEXT        NOT NULL DEFAULT 'family',   -- 'family' | 'psw'
  caregiver_name    TEXT        NOT NULL DEFAULT '',
  caregiver_email   TEXT        NOT NULL DEFAULT '',
  -- Section permissions JSONB shape:
  -- { "medications":{"visible":bool,"contribute":bool}, "vitals":{...}, ... }
  permissions       JSONB       NOT NULL DEFAULT '{
    "medications": {"visible":false,"contribute":false},
    "vitals":      {"visible":false,"contribute":false},
    "visit_notes": {"visible":false,"contribute":false},
    "conditions":  {"visible":false,"contribute":false},
    "allergies":   {"visible":false,"contribute":false},
    "documents":   {"visible":false,"contribute":false}
  }',
  access_revoked    BOOLEAN     NOT NULL DEFAULT FALSE,
  revoked_at        TIMESTAMPTZ,
  last_active       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (caregiver_id, person_id)
);

-- ─── caregiver_invites ──────────────────────────────────────────────────
-- Pending invites (7-day token). Auto-accepted on caregiver login if email matches.
CREATE TABLE IF NOT EXISTS caregiver_invites (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_owner_id  UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  owner_name        TEXT        NOT NULL DEFAULT '',
  person_id         UUID        REFERENCES persons(id)    ON DELETE CASCADE NOT NULL,
  person_name       TEXT        NOT NULL DEFAULT '',
  caregiver_email   TEXT        NOT NULL,
  role              TEXT        NOT NULL DEFAULT 'family',
  permissions       JSONB       NOT NULL DEFAULT '{}',
  token             TEXT        NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── visit_notes ────────────────────────────────────────────────────────
-- Caregiver-logged visit notes — visible to owner in activity feed.
CREATE TABLE IF NOT EXISTS visit_notes (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id       UUID        REFERENCES persons(id) ON DELETE CASCADE NOT NULL,
  logged_by_id    UUID        REFERENCES auth.users(id) NOT NULL,
  logged_by_name  TEXT        NOT NULL DEFAULT '',
  note            TEXT        NOT NULL,
  visit_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── medication_confirmations ───────────────────────────────────────────
-- One row per (person, medication, date). UNIQUE prevents double-confirm.
CREATE TABLE IF NOT EXISTS medication_confirmations (
  id                  UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id           UUID    REFERENCES persons(id)      ON DELETE CASCADE NOT NULL,
  medication_id       UUID    REFERENCES medications(id)  ON DELETE CASCADE NOT NULL,
  confirmed_by_id     UUID    REFERENCES auth.users(id)   NOT NULL,
  confirmed_by_name   TEXT    NOT NULL DEFAULT '',
  given               BOOLEAN NOT NULL,
  confirmation_date   DATE    NOT NULL DEFAULT CURRENT_DATE,
  confirmed_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (person_id, medication_id, confirmation_date)
);

-- ─── activity_log ───────────────────────────────────────────────────────
-- Immutable append-only log of every caregiver action. Never deleted.
-- action_type: 'visit_note' | 'vitals' | 'med_confirmation' | 'document_upload'
CREATE TABLE IF NOT EXISTS activity_log (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id     UUID        REFERENCES auth.users(id),
  actor_name   TEXT        NOT NULL DEFAULT '',
  action_type  TEXT        NOT NULL,
  person_id    UUID        REFERENCES persons(id) ON DELETE CASCADE NOT NULL,
  payload      JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row-level security ─────────────────────────────────────────────────

ALTER TABLE caregiver_relationships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_invites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_notes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log             ENABLE ROW LEVEL SECURITY;

-- caregiver_relationships: owner + caregiver can both read their rows
CREATE POLICY "caregiver_relationships_access"
  ON caregiver_relationships FOR ALL
  USING (auth.uid() = profile_owner_id OR auth.uid() = caregiver_id);

-- caregiver_invites: owner can manage; caregiver can see/accept invites to their email
CREATE POLICY "caregiver_invites_owner"
  ON caregiver_invites FOR ALL
  USING (auth.uid() = profile_owner_id);

CREATE POLICY "caregiver_invites_caregiver_select"
  ON caregiver_invites FOR SELECT
  USING (
    caregiver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "caregiver_invites_caregiver_accept"
  ON caregiver_invites FOR UPDATE
  USING (
    caregiver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- visit_notes: owner of person + caregiver with visit_notes visible permission
CREATE POLICY "visit_notes_access"
  ON visit_notes FOR ALL
  USING (
    auth.uid() = logged_by_id
    OR EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = visit_notes.person_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = visit_notes.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND (cr.permissions -> 'visit_notes' ->> 'visible')::boolean = TRUE
    )
  );

-- medication_confirmations: owner + caregiver with medications permission
CREATE POLICY "med_confirmations_access"
  ON medication_confirmations FOR ALL
  USING (
    auth.uid() = confirmed_by_id
    OR EXISTS (
      SELECT 1 FROM persons p
      WHERE p.id = medication_confirmations.person_id AND p.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM caregiver_relationships cr
      WHERE cr.person_id = medication_confirmations.person_id
        AND cr.caregiver_id = auth.uid()
        AND cr.access_revoked = FALSE
        AND (cr.permissions -> 'medications' ->> 'visible')::boolean = TRUE
    )
  );

-- activity_log: owner + caregiver can both view
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
    )
  );

-- ─── Demo caregiver account note ────────────────────────────────────────
-- Create this account in Supabase Auth → Authentication → Users:
--   Email:    caregiver@carecircle.app
--   Password: caregiver1234
-- Then owner can invite caregiver@carecircle.app from ManageCaregiversScreen.
-- The app auto-accepts the invite when the caregiver logs in.
