// scripts/build-seed.mjs
// Regenera supabase/seed.sql a partir de src/data/products.js, para que los
// datos locales (MOCK_MODE) y los de la base no se desincronicen.
//
//   npm run seed:sql

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { default: PRODUCTS } = await import(
  new URL("../src/data/products.js", import.meta.url).href
);
const { BRANDS, DEFAULT_BRAND } = await import(
  new URL("../src/data/brands.js", import.meta.url).href
);

// Una marca mal escrita en products.js dejaría el producto huérfano en la
// base (sin logo ni filtro): mejor cortar acá.
const known = new Set(BRANDS.map(b => b.id));
const unknown = PRODUCTS.filter(p => !known.has(p.brand ?? DEFAULT_BRAND));
if (unknown.length) {
  console.error(
    `Marca desconocida en: ${unknown.map(p => `${p.slug} (${p.brand})`).join(", ")}. ` +
      `Marcas válidas: ${[...known].join(", ")} (src/data/brands.js).`
  );
  process.exit(1);
}

const q = v => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const j = v =>
  v === null || v === undefined ? "NULL" : `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

const rows = PRODUCTS.map(p =>
  "  (" +
  [
    q(p.slug), q(p.name), q(p.brand ?? DEFAULT_BRAND), q(p.line), q(p.flavor), p.grams, q(p.status),
    p.active, q(p.tag), q(p.emoji), q(p.image), j(p.gallery ?? []), q(p.barcode), j(p.claims),
    j(p.formats), q(p.ingredients), q(p.allergens), j(p.nutrition),
  ].join(", ") +
  ")"
).join(",\n");

const sql = `-- ============================================================
-- Master Snacks — datos iniciales del catálogo
-- Correr DESPUÉS de schema.sql (y de migration-marcas.sql si la base es
-- anterior a la columna brand).
-- Generado desde src/data/products.js (npm run seed:sql).
-- ============================================================

INSERT INTO productos
  (slug, name, brand, line, flavor, grams, status, active, tag, emoji, image,
   gallery, barcode, claims, formats, ingredients, allergens, nutrition)
VALUES
${rows}
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  brand       = EXCLUDED.brand,
  line        = EXCLUDED.line,
  flavor      = EXCLUDED.flavor,
  grams       = EXCLUDED.grams,
  status      = EXCLUDED.status,
  active      = EXCLUDED.active,
  tag         = EXCLUDED.tag,
  emoji       = EXCLUDED.emoji,
  image       = EXCLUDED.image,
  gallery     = EXCLUDED.gallery,
  barcode     = EXCLUDED.barcode,
  claims      = EXCLUDED.claims,
  formats     = EXCLUDED.formats,
  ingredients = EXCLUDED.ingredients,
  allergens   = EXCLUDED.allergens,
  nutrition   = EXCLUDED.nutrition;
`;

writeFileSync(join(ROOT, "supabase", "seed.sql"), sql, "utf8");
console.log(`seed.sql regenerado con ${PRODUCTS.length} productos`);
