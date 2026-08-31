# Chitopo — Catálogo mayorista

Catálogo mayorista de snacks Chitopo (Master Snacks Inversiones SpA, La Pintana, Santiago).
No hay checkout: el local arma su pedido eligiendo cajas o displays, y el pedido se deriva al
WhatsApp del socio, donde se cierra precio, pago y despacho.

React 18 · Vite 5 · Tailwind v4 · framer-motion · Supabase (opcional).

## Correrlo

```bash
npm install
npm run dev
```

- Catálogo: http://localhost:5173
- Panel admin: http://localhost:5173/#/admin

Arranca en **MOCK_MODE**: los productos salen de `src/data/products.js` y nada se persiste.
El panel funciona igual (crear, editar, ocultar, borrar), pero los cambios se pierden al recargar.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build |
| `npm run assets` | Regenera imágenes de producto, favicons y OG desde la carpeta de marca |
| `npm run seed:sql` | Regenera `supabase/seed.sql` desde `src/data/products.js` |

## Precios: modo "a consultar"

Los precios todavía no están definidos, así que el catálogo arranca **sin mostrar precios**:
se comporta como cotizador y el pedido llega a WhatsApp con formatos y cantidades, cerrando
con "Precios a confirmar por este medio".

Para prenderlos:

1. Carga el precio de cada formato en el panel admin (o en `src/data/products.js`).
2. Pon `showPrices: true` en `src/data/store.js`.

`formatPrice()` devuelve `"A consultar"` mientras el flag esté apagado, así que ningún
componente necesita condicionales sueltos.

## Dónde se toca qué

| Quiero cambiar… | Archivo |
|---|---|
| Nombre, tagline, WhatsApp, pedido mínimo, datos legales | `src/data/store.js` |
| Los productos y sus formatos | `src/data/products.js` |
| Colores, tipografías | `src/index.css` (bloque `@theme`) |
| Color de un sabor | `FLAVOR_ACCENTS` en `src/data/store.js` |
| Imágenes de empaque | `npm run assets` (originales en `../Logos vectorizados/`) |

### Formatos de venta

Cada producto tiene un array `formats`. Reemplaza lo que en el proyecto base eran los talles:

```js
formats: [
  { id: "caja-24", label: "Caja", units: 24, stock: 40, price: null },
]
```

- `units` = cuántas bolsas trae el bulto
- `stock` = cuántos bultos hay
- `price: null` = a consultar

> ⚠️ Las cantidades por bulto (24 y 12) son **placeholders**. Hay que confirmarlas con Alex
> y actualizarlas desde el panel.

## Conectar Supabase

El proyecto Supabase anterior fue dado de baja. Para levantar uno nuevo:

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, correr `supabase/schema.sql` y después `supabase/seed.sql`.
3. En **Project Settings → API**, copiar la URL y la publishable key a `.env.local`:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_xxxx
   ```

4. Poner `MOCK_MODE = false` en `src/data/store.js`.
5. Reiniciar `npm run dev` y probar el panel: crear, editar y borrar un producto.

### Seguridad del panel

El login de `src/pages/Admin.jsx` compara usuario y contraseña **en el navegador**. Eso no es
seguridad: el bundle es público y cualquiera puede leer esas credenciales. Sirve solo para que
el panel no quede a la vista.

Lo que protege los datos de verdad son las políticas RLS de `supabase/schema.sql`: lectura
pública de productos, pero escritura solo con sesión autenticada. Para cerrar el círculo,
`supabase/migration-auth.sql` deja lista la migración a Supabase Auth con lista blanca de emails.

Mientras tanto, se puede cambiar la clave sin tocar código:

```
VITE_ADMIN_USER=alex
VITE_ADMIN_PASS=una-clave-larga
```

## Etiquetado (Ley 20.606)

Los productos llevan sello **ALTO EN CALORÍAS**. La ley prohíbe dirigir publicidad a menores
de 14 años. El catálogo es B2B y el footer lo deja por escrito; conviene mantener ese criterio
en cualquier pieza que se sume.

## Pendientes del brief

- Precios mayoristas de cada formato.
- Cantidades reales por caja y display.
- Ficha nutricional de Frutos del Bosque y Tocino Merkén.
- Maní dulce y picante (todavía no existen como SKU).
- Confirmar si Tocino Merkén pasa de concepto a producto real.
- Tipografía oficial: el logo usa una fuente sin licencia confirmada. La web usa alternativas
  libres de Google Fonts (Baloo 2, Archivo, Anton).

## Deploy

`vite.config.js` usa `base: '/'`, listo para servir desde la raíz de un dominio
(ej. `mastersnackschile.com`). Si se publica en un subdirectorio, hay que ajustar `base`.

```bash
npm run build   # genera dist/
```
