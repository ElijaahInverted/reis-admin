-- Feedback responses (NPS, one_change, etc.)
CREATE TABLE IF NOT EXISTS feedback_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id text NOT NULL,
    faculty_id text,
    study_semester int,
    feedback_type text NOT NULL CHECK (feedback_type IN ('nps', 'one_change')),
    value text NOT NULL,
    semester_code text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_feedback_unique
    ON feedback_responses (student_id, feedback_type, semester_code);

ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

-- Deny all direct access; RPCs use SECURITY DEFINER
CREATE POLICY "No direct access to feedback_responses"
    ON feedback_responses FOR ALL USING (false);

-- Daily active usage tracking
CREATE TABLE IF NOT EXISTS daily_active_usage (
    student_id text NOT NULL,
    usage_date date NOT NULL DEFAULT CURRENT_DATE,
    open_count int NOT NULL DEFAULT 1,
    PRIMARY KEY (student_id, usage_date)
);

ALTER TABLE daily_active_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to daily_active_usage"
    ON daily_active_usage FOR ALL USING (false);

-- RPC: submit feedback (upsert)
CREATE OR REPLACE FUNCTION submit_feedback(
    p_student_id text,
    p_faculty_id text,
    p_study_semester int,
    p_feedback_type text,
    p_value text,
    p_semester_code text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO feedback_responses (student_id, faculty_id, study_semester, feedback_type, value, semester_code)
    VALUES (p_student_id, p_faculty_id, p_study_semester, p_feedback_type, p_value, p_semester_code)
    ON CONFLICT (student_id, feedback_type, semester_code)
    DO UPDATE SET value = p_value, faculty_id = p_faculty_id, study_semester = p_study_semester, created_at = now();
END;
$$;

-- RPC: track daily usage (upsert open_count)
CREATE OR REPLACE FUNCTION track_daily_usage(
    p_student_id text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO daily_active_usage (student_id, usage_date, open_count)
    VALUES (p_student_id, CURRENT_DATE, 1)
    ON CONFLICT (student_id, usage_date)
    DO UPDATE SET open_count = daily_active_usage.open_count + 1;
END;
$$;
