-- Migration: lab_results table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS lab_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id       UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date     TEXT,
  source_filename TEXT,
  extracted_data  JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-person queries
CREATE INDEX IF NOT EXISTS lab_results_person_id_idx ON lab_results(person_id);
CREATE INDEX IF NOT EXISTS lab_results_created_at_idx ON lab_results(created_at DESC);

-- Row-level security: users can only see/edit their own data
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lab results"
  ON lab_results
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
