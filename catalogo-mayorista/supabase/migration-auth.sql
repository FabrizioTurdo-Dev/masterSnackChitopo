-- ============================================================
-- Chitopo — seguridad real del panel admin
--
-- Qué hace este archivo:
--   1. Crea `admins`, la lista blanca de emails con acceso al panel.
--   2. Crea el helper is_admin(), que lee el email del JWT de la sesión.
--   3. Reemplaza las políticas de escritura de schema.sql: ya no alcanza
--      con "estar logueado", hay que estar en la lista.
--
-- Después de correrlo, la base rechaza cualquier escritura que no venga de
-- una sesión de un email de esta tabla. No importa qué haga el front: sin
-- ese JWT, Postgres devuelve error. Esa es la barrera de verdad.
--
-- ORDEN DE EJECUCIÓN EN EL SQL EDITOR DE SUPABASE:
--   schema.sql  →  seed.sql  →  este archivo
-- Se puede volver a correr sin romper nada (todo es idempotente).
--
-- ANTES DE CORRERLO:
--   Authentication → Providers → Email: desactivar "Enable email signups"
--   (si no, cualquiera puede crearse una cuenta; no entraría al panel gracias
--   a esta lista, pero tampoco tiene por qué poder registrarse).
--   Los usuarios se crean a mano en Authentication → Users → Add user.
-- ============================================================

-- ── 1. Lista blanca de administradores ──────────────────────
CREATE TABLE IF NOT EXISTS admins (
  email      TEXT PRIMARY KEY,
  nombre     TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Nadie lista esta tabla desde el cliente: cada sesión solo puede ver su
-- propia fila (el panel la usa para confirmar que tiene acceso).
DROP POLICY IF EXISTS "admins sin acceso publico" ON admins;
DROP POLICY IF EXISTS "admins ve su propia fila" ON admins;
CREATE POLICY "admins ve su propia fila" ON admins
  FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- Permisos de tabla (ver sección 5 de schema.sql): el visitante anónimo no
-- entra; el logueado solo puede leer, y RLS lo limita a su propia fila.
REVOKE ALL ON admins FROM anon, authenticated;
GRANT SELECT ON admins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admins TO service_role;

-- ⚠️ EDITAR ACÁ ANTES DE CORRER: un renglón por persona con acceso al panel.
-- Los emails tienen que ser exactamente los mismos que se creen en
-- Authentication → Users. Una cuenta por persona, nunca una compartida:
-- así se sabe quién tocó qué y se le saca el acceso a uno sin afectar al otro.
--
-- Para sacarle el acceso a alguien (ej. cuando termine el desarrollo):
--   DELETE FROM admins WHERE email = 'quien@sea.com';
-- y además borrar su usuario en Authentication → Users.
--
-- Nota: estos emails quedan escritos en el repo. No son credenciales (la clave
-- vive hasheada en Supabase), pero si se prefiere no publicarlos, dejar los
-- placeholders acá y correr el INSERT real a mano en el SQL Editor.
INSERT INTO admins (email, nombre) VALUES
  ('EMAIL-DE-ALEX@dominio.com',     'Alex — dueño'),
  ('EMAIL-DE-FABRIZIO@dominio.com', 'Fabrizio — desarrollo')
ON CONFLICT (email) DO NOTHING;

-- ── 2. Helper ───────────────────────────────────────────────
-- SECURITY DEFINER para que pueda leer `admins` sin depender de las
-- políticas de la propia tabla. search_path fijo para que nadie pueda
-- colgarle una tabla `admins` falsa en otro schema.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Solo una sesión logueada necesita evaluarla. Supabase da EXECUTE a anon
-- por defecto en las funciones nuevas: se lo sacamos explícitamente.
REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, service_role;

-- ── 3. Políticas: escribir exige estar en la lista ──────────
DROP POLICY IF EXISTS "productos escritura admin" ON productos;
CREATE POLICY "productos escritura admin" ON productos
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "pedidos lectura admin" ON pedidos;
CREATE POLICY "pedidos lectura admin" ON pedidos
  FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "pedidos update admin" ON pedidos;
CREATE POLICY "pedidos update admin" ON pedidos
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "pedidos borrado admin" ON pedidos;
CREATE POLICY "pedidos borrado admin" ON pedidos
  FOR DELETE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "config escritura admin" ON config;
CREATE POLICY "config escritura admin" ON config
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- La lectura pública de productos y config se mantiene: el catálogo la
-- necesita sin login. Los pedidos siguen siendo de alta pública (el local
-- los crea sin cuenta) pero solo los admins los leen.

-- ── 4. Verificación ─────────────────────────────────────────
-- Correr esto después y revisar que cada tabla liste sus políticas:
--   SELECT tablename, policyname, cmd, roles
--   FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename, policyname;
