create table study_jam_availability (
  id          uuid        primary key default gen_random_uuid(),
  studium     text        not null,
  course_code text        not null,
  role        text        not null check (role in ('tutor', 'tutee')),
  semester_id text        not null,
  created_at  timestamptz not null default now()
);

alter table study_jam_availability enable row level security;

-- Anon extension can register
create policy "anon_insert" on study_jam_availability
  for insert to anon with check (true);

-- Tutee extension needs to find available tutors
create policy "anon_read_tutors" on study_jam_availability
  for select to anon using (role = 'tutor');

-- Extension cleans up its own record after match (UUID is unguessable)
create policy "anon_delete" on study_jam_availability
  for delete to anon using (true);

-- Admin can read everything
create policy "admin_read_all" on study_jam_availability
  for select to authenticated using (true);
