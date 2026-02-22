-- Create study_jam_dismissals table
CREATE TABLE IF NOT EXISTS study_jam_dismissals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    course_code TEXT NOT NULL,
    semester_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, course_code, semester_id)
);

-- Enable RLS
ALTER TABLE study_jam_dismissals ENABLE ROW LEVEL SECURITY;

-- Allow anon users to insert their own dismissals
CREATE POLICY "anon_insert_dismissal" ON study_jam_dismissals
    FOR INSERT TO anon WITH CHECK (true);

-- Allow anon users to read all dismissals (since student_id check happens client-side or we can tighten it)
-- Actually, let's tightening it to only read their own if we can, but anon doesn't have a reliable auth.uid().
-- Using student_id as the key.
CREATE POLICY "anon_read_dismissals" ON study_jam_dismissals
    FOR SELECT TO anon USING (true);
