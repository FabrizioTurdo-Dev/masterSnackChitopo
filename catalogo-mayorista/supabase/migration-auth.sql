-- ============================================================
-- Chitopo — pasar el panel admin a Supabase Auth
--
-- El login actual (src/pages/Admin.jsx) compara usuario y contraseña en el
-- navegador. Eso NO es seguridad: el bundle es público. Lo que realmente
-- protege los datos son las políticas RLS de schema.sql, que ya exigen una
-- sesión autenticada para escribir.
--
-- Pasos para cerrar el círculo:
--   1. En el dashboard de Supabase → Authentication → Users, crear el usuario
--      de Alex con email y contraseña. Desactivar "Enable email signups"
--      en Providers para que nadie más pueda registrarse.
--   2. Correr este archivo para restringir la escritura a esa lista de emails.
--   3. En el front, reemplazar el login por supabase.auth.signInWithPassword()
--      y guardar la sesión.
-- ============================================================

-- ── Lista blanca de administradores ─────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Nadie lee esta tabla desde el cliente; solo la usan las políticas.
DROP POLICY IF EXISTS "admins sin acceso publico" ON admins;
CREATE POLICY "admins sin acceso publico" ON admins
  FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = email);

-- ⚠️ Reemplazar por el email real antes de correr.
INSERT INTO admins (email) VALUES ('alex@mastersnackschile.com')
ON CONFLICT (email) DO NOTHING;

-- ── Helper ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email'
  );
$$;

-- ── Reemplazar las políticas de escritura ───────────────────
DROP POLICY IF EXISTS "productos escritura admin" ON productos;
CREATE POLICY "productos escritura admin" ON productos
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "pedidos lectura admin" ON pedidos;
CREATE POLICY "pedidos lectura admin" ON pedidos
  FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "pedidos update admin" ON pedidos;
CREATE POLICY "pedidos update admin" ON pedidos
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "config escritura admin" ON config;
CREATE POLICY "config escritura admin" ON config
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- La lectura pública de productos y config se mantiene: el catálogo la necesita.
