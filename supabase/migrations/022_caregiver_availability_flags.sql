-- Add visibility and availability flags to caregiver profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS visible_in_search   BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS accepting_clients   BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS phone               TEXT;
