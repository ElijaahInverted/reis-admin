-- Remove duplicates (keep the latest entry)
DELETE FROM study_jam_availability
WHERE id NOT IN (
    SELECT id FROM (
        SELECT DISTINCT ON (student_id, course_code, semester_id) id
        FROM study_jam_availability
        ORDER BY student_id, course_code, semester_id, created_at DESC
    ) latest_entries
);

-- Add unique constraint
ALTER TABLE study_jam_availability
ADD CONSTRAINT unique_student_course_semester UNIQUE (student_id, course_code, semester_id);
