-- Migration: Refactor Study Jams
-- Drops the legacy study_jam_sessions table and implements the FIFO matching RPC

-- 1. Drop old sessions table
DROP TABLE IF EXISTS study_jam_sessions;

-- 2. Create the FIFO matching RPC
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
      tutor_studium,
      tutee_studium,
      course_code,
      semester_id
    ) VALUES (
      v_tutor.studium,
      v_tutee.studium,
      p_course_code,
      v_tutor.semester_id -- Assuming they match or tutor's is fine
    );

    -- Delete both availabilities
    DELETE FROM study_jam_availability WHERE id = v_tutor.id;
    DELETE FROM study_jam_availability WHERE id = v_tutee.id;
  END IF;
END;
$$;
