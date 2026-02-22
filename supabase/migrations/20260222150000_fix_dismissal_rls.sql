-- Add missing admin policies for study_jam_dismissals
-- The original migration only covered the 'anon' role (used by the extension)

-- Allow admins to read all dismissals
CREATE POLICY "admin_read_dismissals" ON study_jam_dismissals
    FOR SELECT TO authenticated USING (true);

-- Allow admins to delete (revert) dismissals
CREATE POLICY "admin_delete_dismissal" ON study_jam_dismissals
    FOR DELETE TO authenticated USING (get_my_role() = 'reis_admin');
