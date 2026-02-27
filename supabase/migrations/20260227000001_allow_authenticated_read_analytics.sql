-- Allow authenticated users (admin app) to read analytics tables
-- The admin UI already gates access to reis_admin role

DROP POLICY IF EXISTS "No direct access to daily_active_usage" ON daily_active_usage;
DROP POLICY IF EXISTS "No direct access to feedback_responses" ON feedback_responses;

-- Deny direct writes; RPCs handle inserts via SECURITY DEFINER
CREATE POLICY "Deny insert daily_active_usage"
    ON daily_active_usage FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny update daily_active_usage"
    ON daily_active_usage FOR UPDATE USING (false);
CREATE POLICY "Deny delete daily_active_usage"
    ON daily_active_usage FOR DELETE USING (false);

CREATE POLICY "Deny insert feedback_responses"
    ON feedback_responses FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny update feedback_responses"
    ON feedback_responses FOR UPDATE USING (false);
CREATE POLICY "Deny delete feedback_responses"
    ON feedback_responses FOR DELETE USING (false);

-- Allow reads for authenticated users (admin reads)
CREATE POLICY "Allow authenticated read daily_active_usage"
    ON daily_active_usage FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated read feedback_responses"
    ON feedback_responses FOR SELECT
    TO authenticated
    USING (true);
