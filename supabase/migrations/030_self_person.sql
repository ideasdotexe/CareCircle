-- 030 · Add is_self flag to persons
-- Marks a person row as the owner's own health profile record.
ALTER TABLE persons ADD COLUMN IF NOT EXISTS is_self BOOLEAN NOT NULL DEFAULT FALSE;
