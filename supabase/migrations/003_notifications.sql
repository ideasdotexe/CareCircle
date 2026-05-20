-- ─── Notifications table ─────────────────────────────────────────────────────
-- Stores in-app notifications for caregivers and owners.
-- user_id = the recipient of the notification.

create table if not exists notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  type         text not null default 'info',          -- e.g. 'care_request', 'request_accepted'
  title        text not null,
  body         text,
  data         jsonb,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Index so caregivers can quickly fetch their unread notifications
create index if not exists notifications_user_id_idx on notifications(user_id, created_at desc);

-- ─── Row-level security ───────────────────────────────────────────────────────
alter table notifications enable row level security;

-- Users can only see their own notifications
create policy "Users can read own notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- Any authenticated user can insert a notification (sender notifies recipient)
create policy "Authenticated users can insert notifications"
  on notifications for insert
  with check (auth.role() = 'authenticated');

-- Users can mark their own notifications as read
create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- Users can delete their own notifications
create policy "Users can delete own notifications"
  on notifications for delete
  using (auth.uid() = user_id);
