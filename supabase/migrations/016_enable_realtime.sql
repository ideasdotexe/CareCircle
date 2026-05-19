-- Enable Supabase Realtime for tables that drive live UI updates.
-- Without this, postgres_changes subscriptions receive no events.

ALTER PUBLICATION supabase_realtime ADD TABLE caregiver_connections;
ALTER PUBLICATION supabase_realtime ADD TABLE caregiver_relationships;
ALTER PUBLICATION supabase_realtime ADD TABLE visit_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE vitals;
ALTER PUBLICATION supabase_realtime ADD TABLE medications;
