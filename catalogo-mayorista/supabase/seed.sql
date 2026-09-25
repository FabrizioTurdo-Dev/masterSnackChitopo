-- ============================================================
-- Master Snacks — datos iniciales del catálogo
-- Correr DESPUÉS de schema.sql (y de migration-marcas.sql si la base es
-- anterior a la columna brand).
-- Generado desde src/data/products.js (npm run seed:sql).
-- ============================================================

INSERT INTO productos
  (slug, name, brand, line, flavor, grams, status, active, tag, emoji, image,
   gallery, barcode, claims, formats, ingredients, allergens, nutrition)
VALUES
  ('sufle-queso', 'Suflés Queso Horneados', 'chitopo', 'sufles', 'queso', 150, 'activo', true, 'Más vendido', '🧀', '/img/productos/sufle-queso.webp', '[]'::jsonb, '0799192945984', '{"baked":true,"glutenFree":true,"seals":["alto-en-calorias"]}'::jsonb, '[{"id":"caja-24","label":"Caja","units":24,"stock":40,"price":null},{"id":"display-12","label":"Display","units":12,"stock":25,"price":null},{"id":"unidad","label":"Unidad","units":1,"stock":300,"price":null}]'::jsonb, 'Gritz de maíz, aceite vegetal, sólidos de leche, almidón, sal, glutamato monosódico, saborizante y colorantes (amarillo crepúsculo, tartrazina), antioxidantes (BHT, TBHQ).', 'Contiene derivados lácteos.', '{"serving":"15 g","portions":10,"per100g":{"energia":545,"proteinas":6.3,"grasas":31.4,"hidratos":55.6,"azucares":1.52,"sodio":400}}'::jsonb),
  ('sufle-papa', 'Suflés Papa Horneados', 'chitopo', 'sufles', 'papa', 150, 'activo', true, NULL, '🥔', '/img/productos/sufle-papa.webp', '[]'::jsonb, '0799192945977', '{"baked":true,"glutenFree":true,"seals":["alto-en-calorias"]}'::jsonb, '[{"id":"caja-24","label":"Caja","units":24,"stock":35,"price":null},{"id":"display-12","label":"Display","units":12,"stock":20,"price":null},{"id":"unidad","label":"Unidad","units":1,"stock":240,"price":null}]'::jsonb, 'Gritz de maíz, papa en escama, aceite vegetal, sal, glutamato monosódico, antioxidante (BHT, TBHQ).', NULL, '{"serving":"15 g","portions":1,"per100g":{"energia":518,"proteinas":5.2,"grasas":28.7,"hidratos":55.6,"azucares":1.52,"sodio":400}}'::jsonb),
  ('sufle-frutos-del-bosque', 'Suflés Frutos del Bosque', 'chitopo', 'sufles', 'frutos', 125, 'proximamente', true, NULL, '🫐', '/img/productos/sufle-frutos-del-bosque.webp', '[]'::jsonb, NULL, '{"baked":true,"glutenFree":true,"seals":["alto-en-calorias"]}'::jsonb, '[{"id":"caja-24","label":"Caja","units":24,"stock":0,"price":null},{"id":"display-12","label":"Display","units":12,"stock":0,"price":null}]'::jsonb, 'Gritz de maíz, aceite de maravilla, harina de arroz, fibra de manzana, deshidratado en polvo natural de frutos del bosque, colorantes, saborizante natural, azúcar, antioxidante (BHT, TBHQ). (Preliminar)', NULL, NULL),
  ('mani-salado', 'Maní Horneado Salado', 'chitopo', 'mani', 'mani', 60, 'proximamente', true, NULL, '🥜', '/img/productos/mani-salado.webp', '[]'::jsonb, '0799192624322', '{"baked":true,"glutenFree":true,"seals":["alto-en-calorias"]}'::jsonb, '[{"id":"caja-24","label":"Caja","units":24,"stock":0,"price":null},{"id":"display-12","label":"Display","units":12,"stock":0,"price":null}]'::jsonb, 'Maní, sal.', 'Contiene maní.', '{"serving":"30 g","portions":2,"per100g":{"energia":580,"proteinas":26,"grasas":49,"hidratos":12,"azucares":6,"sodio":350,"fibra":8}}'::jsonb),
  ('tocino-merken', 'Tocino Merkén', 'chitopo', 'aros', 'tocino', 130, 'proximamente', true, 'Viene fuertón', '🌶️', '/img/productos/tocino-merken.webp', '[{"src":"/img/productos/tocino-merken-reverso.webp","label":"Reverso"}]'::jsonb, '0762083569200', '{"baked":true,"glutenFree":true,"seals":["alto-en-calorias"]}'::jsonb, '[{"id":"caja-24","label":"Caja","units":24,"stock":0,"price":null}]'::jsonb, 'Gritz de maíz, aceite vegetal (TBHQ), harina de arroz, saborizante tocino, merkén, glutamato, sal, colorante rojo.', 'Contiene derivados de soya.', '{"serving":"15 g","portions":9,"per100g":{"energia":451,"proteinas":6.2,"grasas":20.6,"hidratos":7.8,"azucares":1.8,"sodio":398}}'::jsonb)
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
