-- Make location and scheduled_at optional (tutor sets these after registering)
alter table study_jam_sessions
  alter column location drop not null,
  alter column scheduled_at drop not null;

-- Add columns for tutor-led 1:1 session model
alter table study_jam_sessions
  add column if not exists max_tutees    int  not null default 1,
  add column if not exists tutee_count   int  not null default 0,
  add column if not exists tutor_studium text;

-- New sessions start as 'open' (waiting for a tutor to register)
alter table study_jam_sessions
  alter column status set default 'open';

-- Expand status check constraint to include new states
alter table study_jam_sessions drop constraint study_jam_sessions_status_check;
alter table study_jam_sessions add constraint study_jam_sessions_status_check
  check (status = any (array['open', 'scheduled', 'full', 'completed', 'cancelled']));
