-- ============================================================
-- Chitopo — catálogo mayorista
-- Ejecutar en el SQL Editor de Supabase, sobre un proyecto nuevo.
-- Después correr seed.sql para cargar los 5 productos reales, y al final
-- migration-auth.sql.
--
-- ⚠️ Si alguna vez se vuelve a correr este archivo, correr migration-auth.sql
-- de nuevo inmediatamente después: acá las políticas de escritura dejan pasar
-- a cualquier sesión, y es migration-auth.sql el que las restringe a la
-- lista de admins.
-- ============================================================

-- ── 1. PRODUCTOS ────────────────────────────────────────────
-- Un producto = un SKU (sabor + gramaje). Los bultos de venta
-- (caja, display, unidad) viven en formats como JSONB:
--   [{ "id":"caja-24", "label":"Caja", "units":24, "stock":40, "price":null }]
-- price en null significa "a consultar".

CREATE TABLE IF NOT EXISTS productos (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  line        TEXT NOT NULL DEFAULT 'sufles',
  flavor      TEXT,
  grams       INT  NOT NULL,
  status      TEXT NOT NULL DEFAULT 'activo'
              CHECK (status IN ('activo', 'proximamente')),
  active      BOOLEAN NOT NULL DEFAULT true,
  tag         TEXT,
  emoji       TEXT DEFAULT '🍿',
  image       TEXT,
  -- Imágenes extra de la ficha: [{ "src":"/img/...", "label":"Reverso" }]
  gallery     JSONB NOT NULL DEFAULT '[]'::jsonb,
  barcode     TEXT,
  claims      JSONB NOT NULL DEFAULT '{"baked":true,"glutenFree":false,"seals":[]}'::jsonb,
  formats     JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredients TEXT,
  allergens   TEXT,
  nutrition   JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS productos_line_idx   ON productos (line);
CREATE INDEX IF NOT EXISTS productos_active_idx ON productos (active);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- El catálogo es público: cualquiera lee. Escribir exige sesión.
DROP POLICY IF EXISTS "productos lectura publica" ON productos;
CREATE POLICY "productos lectura publica" ON productos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "productos escritura admin" ON productos;
CREATE POLICY "productos escritura admin" ON productos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 2. PEDIDOS ──────────────────────────────────────────────
-- Se guardan al momento de derivar a WhatsApp. total puede ser NULL
-- mientras el catálogo esté en modo "precio a consultar".

CREATE TABLE IF NOT EXISTS pedidos (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client     TEXT NOT NULL,          -- nombre del local
  contact    TEXT,                   -- persona que hace el pedido
  phone      TEXT,
  units      INT  NOT NULL DEFAULT 0, -- total de bolsas
  total      NUMERIC,                 -- NULL = a confirmar
  -- nuevo (llegó por WhatsApp) → pendiente (cotización enviada) →
  -- confirmado → enviado; o cancelado. Lo avanzan los dueños desde el panel.
  status     TEXT NOT NULL DEFAULT 'nuevo'
             CHECK (status IN ('nuevo', 'pendiente', 'confirmado', 'enviado', 'cancelado')),
  ref        TEXT,                    -- código del mensaje de WhatsApp (CH-XXXX)
  items      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pedidos_status_idx ON pedidos (status, created_at DESC);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Un cliente anónimo puede crear su pedido, pero no leer los de otros.
-- Solo como "nuevo": si no, cualquiera con la anon key podría meter pedidos
-- ya confirmados.
DROP POLICY IF EXISTS "pedidos alta publica" ON pedidos;
CREATE POLICY "pedidos alta publica" ON pedidos
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'nuevo');

DROP POLICY IF EXISTS "pedidos lectura admin" ON pedidos;
CREATE POLICY "pedidos lectura admin" ON pedidos
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "pedidos update admin" ON pedidos;
CREATE POLICY "pedidos update admin" ON pedidos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ── 3. CONFIG ───────────────────────────────────────────────
-- Fila única con los parámetros que Alex puede querer cambiar sin deploy.

CREATE TABLE IF NOT EXISTS config (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  shop_name   TEXT    DEFAULT 'Chitopo',
  phone       TEXT    DEFAULT '56978632055',
  min_order   INT     DEFAULT 100,     -- en unidades (bolsas)
  currency    TEXT    DEFAULT 'CLP',
  show_prices BOOLEAN DEFAULT false,   -- false = modo "a consultar"
  low_stock   INT     DEFAULT 5,       -- umbral en bultos
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "config lectura publica" ON config;
CREATE POLICY "config lectura publica" ON config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "config escritura admin" ON config;
CREATE POLICY "config escritura admin" ON config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO config (shop_name, phone)
SELECT 'Chitopo', '56978632055'
WHERE NOT EXISTS (SELECT 1 FROM config);

-- ── 4. updated_at automático ────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_config_updated_at ON config;
CREATE TRIGGER trg_config_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 5. Permisos para la API (GRANT) ─────────────────────────
-- Desde mayo de 2026 los proyectos nuevos de Supabase no exponen las tablas
-- a la API automáticamente: sin estos GRANT el front recibe
-- "permission denied for table ...".
--
-- Son dos capas distintas y hacen falta las dos:
--   GRANT = a qué TABLAS puede entrar cada rol.
--   RLS   = qué FILAS ve o modifica dentro de esa tabla (políticas de arriba).
--
--   anon          = visitante sin sesión (el catálogo público)
--   authenticated = alguien logueado (el panel admin)
--
-- Primero se limpia todo y después se da lo justo, así el resultado es el
-- mismo sin importar cómo se haya creado el proyecto.

REVOKE ALL ON productos, pedidos, config FROM anon, authenticated;

GRANT SELECT ON productos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON productos TO authenticated;

-- El local manda su pedido sin cuenta, pero no puede leer ninguno.
GRANT INSERT ON pedidos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON pedidos TO authenticated;

GRANT SELECT ON config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON config TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON productos, pedidos, config TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
