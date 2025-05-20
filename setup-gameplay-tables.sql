-- Create archetypes table
CREATE TABLE IF NOT EXISTS archetypes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  description TEXT NOT NULL,
  unlock_condition TEXT NOT NULL,
  compatible_routes TEXT[] NOT NULL,
  challenge_modes TEXT[] NOT NULL,
  sticker_url TEXT,
  is_unlocked BOOLEAN DEFAULT false
);

-- Create game_routes table
CREATE TABLE IF NOT EXISTS game_routes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  mechanics JSONB NOT NULL
);

-- Create archetype_challenges table
CREATE TABLE IF NOT EXISTS archetype_challenges (
  id TEXT PRIMARY KEY,
  archetype_id TEXT NOT NULL REFERENCES archetypes(id),
  route_id TEXT NOT NULL REFERENCES game_routes(id),
  challenge_text TEXT NOT NULL,
  mode TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  reward_type TEXT NOT NULL
);

-- Create challenge_completions table
CREATE TABLE IF NOT EXISTS challenge_completions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  archetype_id TEXT NOT NULL,
  route_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  team TEXT NOT NULL,
  media_type TEXT,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_archetypes table
CREATE TABLE IF NOT EXISTS user_archetypes (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  archetype_id TEXT NOT NULL REFERENCES archetypes(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, archetype_id)
);

-- Enable RLS on all tables
ALTER TABLE archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_archetypes ENABLE ROW LEVEL SECURITY;

-- Create policies for archetypes (everyone can read)
CREATE POLICY "Anyone can read archetypes" ON archetypes
  FOR SELECT USING (true);

-- Create policies for game_routes (everyone can read)
CREATE POLICY "Anyone can read game_routes" ON game_routes
  FOR SELECT USING (true);

-- Create policies for archetype_challenges (everyone can read)
CREATE POLICY "Anyone can read archetype_challenges" ON archetype_challenges
  FOR SELECT USING (true);

-- Create policies for challenge_completions
CREATE POLICY "Anyone can read challenge_completions" ON challenge_completions
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own challenge_completions" ON challenge_completions
  FOR INSERT WITH CHECK (true);

-- Create policies for user_archetypes
CREATE POLICY "Users can read their own unlocked archetypes" ON user_archetypes
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own unlocked archetypes" ON user_archetypes
  FOR INSERT WITH CHECK (true);
