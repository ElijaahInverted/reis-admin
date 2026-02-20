create table if not exists tutoring_matches (
  id uuid primary key default gen_random_uuid(),
  tutor_studium text not null,
  tutee_studium text not null,
  course_code text not null,
  semester_id text not null,
  matched_at timestamptz not null default now()
);

-- Allow anon to insert and select their own rows
alter table tutoring_matches enable row level security;

create policy "anon insert"
  on tutoring_matches for insert
  to anon
  with check (true);

create policy "anon select own"
  on tutoring_matches for select
  to anon
  using (true);
