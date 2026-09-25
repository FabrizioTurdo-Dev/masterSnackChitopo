# Master Snacks — Catálogo mayorista

Catálogo mayorista de Master Snacks (Master Snacks Inversiones SpA, La Pintana, Santiago).
Cada producto pertenece a una de sus marcas: hoy todos son de **Chitopo**, la de horneados.
No hay checkout: el local arma su pedido eligiendo cajas o displays, y el pedido se deriva al
WhatsApp del socio, donde se cierra precio, pago y despacho.

React 18 · Vite 5 · Tailwind v4 · framer-motion · GSAP · Supabase (opcional).

## Correrlo

```bash
npm install
npm run dev
```

- Catálogo: http://localhost:5173
- Panel admin: http://localhost:5173/#/admin

Con credenciales de Supabase en `.env.local` (ver más abajo), los productos, el umbral de
stock bajo y los pedidos salen de la base, y el panel guarda ahí lo que se edita. Sin
credenciales, los productos salen de `src/data/products.js` y el panel abre en **modo demo**:
funciona igual (crear, editar, ocultar, borrar), pero los cambios se pierden al recargar.
Para ver el modo demo teniendo credenciales, `npm run dev -- --mode demo` con un
`.env.demo.local` que deje las dos variables vacías.

`src/data/products.js` sigue siendo el respaldo: si la base no responde, el catálogo muestra
esos productos (y el panel no deja editar). También es la fuente de `supabase/seed.sql`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build |
| `npm run assets` | Regenera imágenes de producto, favicons y OG (`-- empaques`, `-- chitopo` o `-- marca` para un solo paso) |
| `npm run media` | Procesa logos, videos y recortes nuevos de `../landing/src/assets` (`-- mastersnacks` para el logo de la empresa) |
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
| Datos de la empresa y de cada marca | `src/data/brands.js` (espejo de `../landing/src/data/brands.js`) |
| WhatsApp, pedido mínimo, líneas, formatos por defecto | `src/data/store.js` |
| Los productos, su marca y sus formatos | `src/data/products.js` |
| Logo de una marca en tarjetas y filtros | `src/components/brand/BrandMark.jsx` |
| Colores, tipografías | `../shared/marca/` (`tokens.css` con las paletas; `master-snacks.css` y `chitopo.css` con cada identidad) |
| Color de un sabor | `FLAVOR_ACCENTS` en `src/data/store.js` |
| Mensajes de WhatsApp del pedido | `src/lib/orderMessage.js` |
| Imágenes de empaque | `npm run assets` (originales en `../Logos vectorizados/`) |
| Logo de Master Snacks (sticker, HD, íconos y OG) | `npm run media -- mastersnacks` y después `npm run assets -- marca` |

### Marcas

Master Snacks es la empresa; cada producto tiene `brand` con el id de una de sus marcas
(`src/data/brands.js`). Con una sola marca cargada el catálogo y el panel no muestran nada
extra; con dos o más aparecen el filtro por marca, la columna en la tabla del panel y el
desglose del dashboard, y el mensaje de WhatsApp agrupa los ítems por marca.

Para sumar una marca: agregarla en `brands.js` (acá y en la landing), darle su logo en
`BrandMark.jsx` y, si trae líneas o sabores nuevos, sumarlos en `store.js`. La base no
necesita migración: `brand` es texto libre.

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

El proyecto vive en la cuenta de Supabase del cliente (Master Snacks). Pasos, en orden:

1. **Crear el proyecto** en [supabase.com](https://supabase.com) y elegir la región más
   cercana (`South America (São Paulo)`).
2. **SQL Editor**, en este orden:
   `supabase/schema.sql` → `supabase/seed.sql` → `supabase/migration-auth.sql` →
   `supabase/migration-pedidos.sql` (antes de `migration-auth.sql`, editar la lista de
   emails que está adentro). En una base creada antes de la columna `brand`, correr
   además `supabase/migration-marcas.sql` antes de volver a correr `seed.sql`.
3. **Project Settings → API**: copiar la URL y la publishable key a `.env.local`:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_xxxx
   ```

   Las mismas dos variables van en Netlify → Site configuration → Environment variables.
4. Reiniciar `npm run dev` y probar el login del panel.

Con las credenciales cargadas, el catálogo público lee productos y config de la base con la
anon key (`src/lib/supabaseRest.js`, sin supabase-js), y cada pedido que un local manda por
WhatsApp se guarda como "nuevo". El panel escribe con la sesión del admin (supabase-js).

La anon key es pública por diseño (viaja en el bundle del navegador). Lo que impide que
alguien la use para escribir son las políticas RLS. **La service_role key nunca va al front
ni al repo**: esa sí saltea todas las políticas.

## Seguridad del panel

El panel (`/#/admin`) usa **Supabase Auth**: email + contraseña reales contra
`supabase.auth.signInWithPassword()` (`src/context/AuthContext.jsx`). La sesión queda
guardada en el navegador y se cierra desde el botón del sidebar.

Hay dos barreras, y solo la segunda es la que protege de verdad:

| Capa | Dónde | Qué hace |
|---|---|---|
| Login | `src/pages/Admin.jsx` | Decide qué se ve. Es UX, no seguridad. |
| RLS | `supabase/migration-auth.sql` | Decide qué se puede escribir. Es la barrera real. |

Además de RLS, `schema.sql` define los `GRANT` de cada tabla: desde mayo de 2026 Supabase no
expone las tablas nuevas a la API automáticamente, y sin ellos el front recibe
`permission denied for table ...`.

Después de `migration-auth.sql`, la base solo acepta escrituras de sesiones cuyo email esté
en la tabla `admins`. Aunque alguien rearme la interfaz o pegue directo contra la API con la
anon key, Postgres le devuelve error.

**Alta de un administrador** (no se hace desde el código):

1. Authentication → Users → **Add user** → email + contraseña. Marcar *Auto Confirm User*.
2. Agregarlo a la whitelist:
   ```sql
   INSERT INTO admins (email, nombre) VALUES ('nuevo@dominio.com', 'Nombre');
   ```

**Baja**: borrar el usuario en Authentication → Users **y** la fila de `admins`.

**Contraseña olvidada o cambio de clave**: Authentication → Users → borrar el usuario y
volver a crearlo con *Add user*, mismo email y clave nueva. La fila de `admins` se mantiene
porque va por email. No hay flujo de "olvidé mi contraseña" dentro del panel a propósito: son
dos cuentas, y el link de recuperación de Supabase choca con el HashRouter.

**Checklist de configuración en el dashboard de Supabase:**

- Authentication → Providers → Email: **desactivar "Enable email signups"**. Nadie tiene por
  qué registrarse solo; las cuentas se crean a mano.
- Authentication → Providers → Email: dejar activo *Confirm email* y no habilitar otros
  providers (Google, GitHub, etc.).
- Project Settings → API: la `service_role` key no se comparte ni se sube a ningún lado.
- Verificar que las políticas quedaron aplicadas:
  ```sql
  SELECT tablename, policyname, cmd, roles FROM pg_policies
  WHERE schemaname = 'public' ORDER BY tablename;
  ```

**Cómo probar que la seguridad funciona** (vale la pena hacerlo una vez): abrir el catálogo
público en una ventana de incógnito, abrir la consola del navegador y pegar un insert contra
la API con la anon key. Tiene que devolver `new row violates row-level security policy`.

En desarrollo, si `.env.local` está vacío, el panel ofrece un botón de "modo demo" con datos
en memoria. Esa puerta solo existe con `npm run dev`: en el build de producción se compila
afuera (`import.meta.env.DEV`).

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
