-- Create a table for challenge completions
CREATE TABLE IF NOT EXISTS challenge_completions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge TEXT NOT NULL,
  mode TEXT NOT NULL,
  team TEXT NOT NULL,
  recording_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all authenticated users to select challenge completions
CREATE POLICY "Allow select for all users" ON challenge_completions
  FOR SELECT USING (true);

-- Create a policy that allows authenticated users to insert their own challenge completions
CREATE POLICY "Allow insert for authenticated users" ON challenge_completions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Enable realtime subscriptions for this table
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_completions;
