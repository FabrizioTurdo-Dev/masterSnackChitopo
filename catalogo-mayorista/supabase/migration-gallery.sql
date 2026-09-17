-- ============================================================
-- Chitopo — imágenes extra por producto (galería de la ficha)
-- Para bases creadas antes de que schema.sql tuviera la columna.
-- Correr una vez en el SQL Editor de Supabase, y después seed.sql.
-- ============================================================

ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb;

-- El pedido mínimo pasó de 24 a 100 unidades.
ALTER TABLE config ALTER COLUMN min_order SET DEFAULT 100;
UPDATE config SET min_order = 100 WHERE min_order = 24;
