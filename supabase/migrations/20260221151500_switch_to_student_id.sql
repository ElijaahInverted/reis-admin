-- Migration: Switch to Student ID
-- Rename all `studium` columns to `student_id` in Study Jams tables

-- 1. Update `study_jam_availability`
ALTER TABLE study_jam_availability RENAME COLUMN studium TO student_id;

-- 2. Update `tutoring_matches`
ALTER TABLE tutoring_matches RENAME COLUMN tutor_studium TO tutor_student_id;
ALTER TABLE tutoring_matches RENAME COLUMN tutee_studium TO tutee_student_id;

-- 3. Replace the `match_study_jam` RPC to use the new names
CREATE OR REPLACE FUNCTION match_study_jam(p_course_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tutor RECORD;
  v_tutee RECORD;
BEGIN
  -- Find the oldest available tutor for this course
  SELECT * INTO v_tutor
  FROM study_jam_availability
  WHERE course_code = p_course_code AND role = 'tutor'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- Find the oldest available tutee for this course
  SELECT * INTO v_tutee
  FROM study_jam_availability
  WHERE course_code = p_course_code AND role = 'tutee'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- Only proceed if we found both a tutor and a tutee
  IF v_tutor IS NOT NULL AND v_tutee IS NOT NULL THEN
    -- Insert the match
    INSERT INTO tutoring_matches (
      tutor_student_id,
      tutee_student_id,
      course_code,
      semester_id
    ) VALUES (
      v_tutor.student_id,
      v_tutee.student_id,
      p_course_code,
      v_tutor.semester_id
    );

    -- Delete both availabilities
    DELETE FROM study_jam_availability WHERE id = v_tutor.id;
    DELETE FROM study_jam_availability WHERE id = v_tutee.id;
  END IF;
END;
$$;
