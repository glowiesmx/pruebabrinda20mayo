-- Insert sample rewards for Tigres
INSERT INTO rewards (name, description, type, team_id, value, image_url)
VALUES 
  ('Sticker "Tigre Salvaje"', 'Sticker digital exclusivo para fans de Tigres', 'digital', 'tigres', NULL, '/placeholder.svg?height=200&width=200'),
  ('Shot "Gignac Special"', 'Shot especial inspirado en el delantero estrella', 'fisico', 'tigres', NULL, '/placeholder.svg?height=200&width=200'),
  ('Tarjeta de Regalo $50 MXN', 'Tarjeta de regalo para usar en cualquier tienda', 'monetary_giftcard_small', 'tigres', 5000, '/placeholder.svg?height=200&width=200');

-- Insert sample rewards for Rayados
INSERT INTO rewards (name, description, type, team_id, value, image_url)
VALUES 
  ('Sticker "Rayo Explosivo"', 'Sticker digital exclusivo para fans de Rayados', 'digital', 'rayados', NULL, '/placeholder.svg?height=200&width=200'),
  ('Shot "Rayado Power"', 'Shot especial con los colores del equipo', 'fisico', 'rayados', NULL, '/placeholder.svg?height=200&width=200'),
  ('Tarjeta de Regalo $50 MXN', 'Tarjeta de regalo para usar en cualquier tienda', 'monetary_giftcard_small', 'rayados', 5000, '/placeholder.svg?height=200&width=200');
