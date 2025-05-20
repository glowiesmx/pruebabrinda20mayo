-- Drop existing policies if they exist
DROP POLICY IF EXISTS "challenge_completions_select_policy" ON challenge_completions;
DROP POLICY IF EXISTS "challenge_completions_insert_policy" ON challenge_completions;

-- Create new policies with proper permissions
CREATE POLICY "challenge_completions_select_policy" ON challenge_completions
  FOR SELECT USING (true);

CREATE POLICY "challenge_completions_insert_policy" ON challenge_completions
  FOR INSERT WITH CHECK (true);  -- Allow all inserts for now, we'll validate in the application
