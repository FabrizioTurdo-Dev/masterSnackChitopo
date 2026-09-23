-- ============================================================
-- Master Snacks — marca de cada producto
-- Master Snacks es la empresa y cada producto pertenece a una de sus
-- marcas (hoy solo Chitopo, la de horneados). Ejecutar en el SQL Editor de
-- Supabase sobre una base que ya tiene schema.sql, ANTES del seed.sql nuevo
-- y antes de pasar MOCK_MODE a false: sin esta columna, crear o editar
-- productos desde el panel falla con "column brand does not exist".
--
-- Se puede correr más de una vez. Los productos que ya existen quedan
-- como Chitopo.
-- ============================================================

-- Texto libre, sin CHECK: sumar una marca nueva no requiere migración. La
-- lista de marcas válidas vive en src/data/brands.js.
ALTER TABLE productos ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT 'chitopo';
CREATE INDEX IF NOT EXISTS productos_brand_idx ON productos (brand);

-- El nombre de la tienda es el de la empresa.
ALTER TABLE config ALTER COLUMN shop_name SET DEFAULT 'Master Snacks';
UPDATE config SET shop_name = 'Master Snacks' WHERE shop_name = 'Chitopo';
