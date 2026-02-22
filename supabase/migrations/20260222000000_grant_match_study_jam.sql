-- Allow authenticated users to call match_study_jam RPC
-- Previously only callable via service role key
GRANT EXECUTE ON FUNCTION public.match_study_jam(text) TO authenticated;
