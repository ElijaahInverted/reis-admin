-- Tighten RLS policies: restrict writes to reis_admin role only
-- Previously, several policies allowed any authenticated user to perform writes

-- 1. killer_courses: restrict writes to reis_admin
DROP POLICY "Authed write" ON killer_courses;
CREATE POLICY "admin_write" ON killer_courses
  FOR ALL TO authenticated
  USING (get_my_role() = 'reis_admin')
  WITH CHECK (get_my_role() = 'reis_admin');

-- 2. study_jam_availability: restrict admin write policies to reis_admin
DROP POLICY "admin_insert" ON study_jam_availability;
DROP POLICY "admin_update" ON study_jam_availability;
DROP POLICY "admin_delete" ON study_jam_availability;

CREATE POLICY "admin_insert" ON study_jam_availability
  FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'reis_admin');
CREATE POLICY "admin_update" ON study_jam_availability
  FOR UPDATE TO authenticated
  USING (get_my_role() = 'reis_admin') WITH CHECK (get_my_role() = 'reis_admin');
CREATE POLICY "admin_delete" ON study_jam_availability
  FOR DELETE TO authenticated USING (get_my_role() = 'reis_admin');

-- 3. tutoring_matches: restrict admin write policies to reis_admin
DROP POLICY "admin_insert" ON tutoring_matches;
DROP POLICY "admin_update" ON tutoring_matches;
DROP POLICY "admin_delete" ON tutoring_matches;

CREATE POLICY "admin_insert" ON tutoring_matches
  FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'reis_admin');
CREATE POLICY "admin_update" ON tutoring_matches
  FOR UPDATE TO authenticated
  USING (get_my_role() = 'reis_admin') WITH CHECK (get_my_role() = 'reis_admin');
CREATE POLICY "admin_delete" ON tutoring_matches
  FOR DELETE TO authenticated USING (get_my_role() = 'reis_admin');

-- 4. spolky_accounts: add WITH CHECK to prevent role escalation
DROP POLICY "auth_update_spolky_accounts" ON spolky_accounts;
CREATE POLICY "auth_update_spolky_accounts" ON spolky_accounts
  FOR UPDATE TO authenticated
  USING (get_my_role() = 'reis_admin')
  WITH CHECK (get_my_role() = 'reis_admin');
