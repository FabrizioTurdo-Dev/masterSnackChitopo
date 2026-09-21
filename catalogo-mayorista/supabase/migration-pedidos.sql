-- ═══════════════════════════════════════════════════════════════
-- Pedidos: estado "nuevo" y código de referencia
--
-- Correr en el SQL Editor después de schema.sql, seed.sql y
-- migration-auth.sql. Se puede correr más de una vez sin romper nada.
--
-- Desde este cambio el catálogo guarda el pedido en Supabase cuando el
-- local lo manda por WhatsApp. Entra como "nuevo" y los dueños lo avanzan
-- desde el panel: pendiente (cotización enviada) → confirmado → enviado,
-- o cancelado. El código (CH-XXXX) va en el mensaje de WhatsApp y en el
-- panel, para cruzar uno con otro.
--
-- Si schema.sql se corre por primera vez después de este cambio, ya trae
-- todo esto y este archivo no hace nada nuevo.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS ref TEXT;

ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_status_check
  CHECK (status IN ('nuevo', 'pendiente', 'confirmado', 'enviado', 'cancelado'));
ALTER TABLE pedidos ALTER COLUMN status SET DEFAULT 'nuevo';

-- El local solo puede crear pedidos nuevos: sin esto, cualquiera con la
-- anon key podría insertarlos ya "confirmados".
DROP POLICY IF EXISTS "pedidos alta publica" ON pedidos;
CREATE POLICY "pedidos alta publica" ON pedidos
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'nuevo');
