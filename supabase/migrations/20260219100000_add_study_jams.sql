create table killer_courses (
  id uuid primary key default gen_random_uuid(),
  course_code text not null unique,
  course_name text not null,
  faculty text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table study_jam_sessions (
  id uuid primary key default gen_random_uuid(),
  killer_course_id uuid not null references killer_courses(id) on delete cascade,
  location text not null,
  scheduled_at timestamptz not null,
  max_participants int not null default 6,
  current_count int not null default 0,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled')),
  notes text null,
  created_by text not null,
  created_at timestamptz not null default now()
);

alter table killer_courses enable row level security;
alter table study_jam_sessions enable row level security;

create policy "Public read" on killer_courses for select using (true);
create policy "Authed write" on killer_courses for all using (auth.role() = 'authenticated');

create policy "Public read" on study_jam_sessions for select using (true);
create policy "Authed write" on study_jam_sessions for all using (auth.role() = 'authenticated');
create policy "Anon count increment" on study_jam_sessions for update using (true) with check (true);
