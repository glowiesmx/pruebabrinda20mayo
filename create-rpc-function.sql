-- Crear una función RPC para insertar desafíos completados
CREATE OR REPLACE FUNCTION insert_challenge_completion(
  user_id TEXT,
  challenge TEXT,
  mode TEXT,
  team TEXT,
  recording_type TEXT DEFAULT NULL
) RETURNS SETOF challenge_completions AS $$
BEGIN
  RETURN QUERY
  INSERT INTO challenge_completions (user_id, challenge, mode, team, recording_type)
  VALUES (user_id, challenge, mode, team, recording_type)
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
