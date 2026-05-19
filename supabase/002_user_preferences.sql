-- Migration: user_preferences
-- Optional: adds a preferences JSONB column to profiles for future cloud-sync of settings.
-- Currently, preferences are stored in AsyncStorage on the device (@carecircle/prefs_v1).
-- Run this if you want to sync preferences across devices in a future update.

-- Add preferences column to profiles table (if it exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}';

-- Example preferences shape stored by AccountScreen:
-- {
--   "notif_medicine": true,
--   "notif_refill": true,
--   "notif_interaction": true,
--   "notif_emergency": true,
--   "notif_email": false,
--   "notif_push": true,
--   "notif_sms": false,
--   "ai_consent": true,
--   "cloud_backup": true,
--   "language": "English",
--   "region": "Canada"
-- }
