-- ============================================================
-- Master Snacks — textos del catálogo editables desde el panel
-- La pestaña Configuración edita el nombre del comercio, el WhatsApp, el
-- pedido mínimo, los precios visibles y el umbral de stock (columnas que
-- ya trae schema.sql). Este archivo suma los dos textos del catálogo:
--   welcome → la bajada bajo «Catálogo mayorista». En NULL rige la del código.
--   notice  → el aviso destacado sobre el catálogo. En NULL no se muestra.
--
-- Ejecutar en el SQL Editor de Supabase sobre una base que ya tiene
-- schema.sql. Se puede correr más de una vez. Las políticas de
-- migration-auth.sql son por fila: cubren estas columnas sin cambios.
-- ============================================================

ALTER TABLE config ADD COLUMN IF NOT EXISTS welcome TEXT;
ALTER TABLE config ADD COLUMN IF NOT EXISTS notice  TEXT;
