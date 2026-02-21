-- Add missing admin policies for study_jam_availability
create policy "admin_insert" on study_jam_availability
  for insert to authenticated with check (true);

create policy "admin_update" on study_jam_availability
  for update to authenticated using (true) with check (true);

create policy "admin_delete" on study_jam_availability
  for delete to authenticated using (true);

-- Add missing admin policies for tutoring_matches
create policy "admin_select" on tutoring_matches
  for select to authenticated using (true);

create policy "admin_insert" on tutoring_matches
  for insert to authenticated with check (true);

create policy "admin_update" on tutoring_matches
  for update to authenticated using (true) with check (true);

create policy "admin_delete" on tutoring_matches
  for delete to authenticated using (true);
