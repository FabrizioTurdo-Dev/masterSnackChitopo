# Estado del proyecto — Chitopo

Última actualización: 2026-08-31

## 1. Resumen

Un solo repositorio con dos apps React + Vite independientes, desplegadas juntas en un solo sitio de Netlify:

- **`landing/`** — sitio de marketing (una sola página, secciones ancladas).
- **`catalogo-mayorista/`** — catálogo B2B con carrito, pedido derivado a WhatsApp, y panel de administración.

En producción quedan bajo el mismo dominio: la landing en `/` y el catálogo en `/catalogo/`.

- Repo: https://github.com/FabrizioTurdo-Dev/masterSnackChitopo
- Link de producción: **completar acá una vez conectado el sitio en Netlify**

## 2. Qué está hecho y funcionando

- Landing completa: hero, historia, productos destacados, FAQ, contacto, animaciones (GSAP + Lenis), responsive.
- Catálogo: browse de productos, filtros, carrito, pedido derivado a WhatsApp.
- Panel de admin (`/catalogo/#/admin`): dashboard, CRUD de productos, listado de pedidos, configuración de tienda — todo funcional en UI.
- Infra: repo unificado, build combinado (`build.mjs`) que compila ambas apps y las publica bajo un mismo dominio, `netlify.toml` con el redirect necesario para el panel admin.
- **Modo actual: `MOCK_MODE = true`** (`catalogo-mayorista/src/data/store.js`) — el catálogo y el panel admin trabajan con datos en memoria (`src/data/products.js`). Nada de lo que se edite en el panel admin persiste: se pierde al recargar la página.

## 3. Pendientes críticos para "terminar"

### 3.1 Conexión real a Supabase (base de datos + auth del admin)

Hoy no hay ninguna base de datos conectada. El catálogo corre en memoria, y el login del panel admin es un `if` de JavaScript en el cliente comparando contra un usuario/clave por defecto (`admin` / `chitopo2026`, sobreescribibles por variables de entorno) — **no es seguridad real**, cualquiera con acceso a las herramientas de desarrollador del navegador puede saltearlo. Lo que protegería datos de verdad son las políticas de acceso (RLS) de Supabase, y esas recién existen una vez conectada la base.

El código para conectar ya está escrito y listo, solo falta ejecutarlo:

1. Crear un proyecto nuevo en [supabase.com](https://supabase.com) (el proyecto anterior fue dado de baja).
2. Correr `catalogo-mayorista/supabase/schema.sql` y `catalogo-mayorista/supabase/seed.sql` en el SQL Editor de Supabase.
3. Cargar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `catalogo-mayorista/.env.local` (para desarrollo local) y en las variables de entorno del sitio en Netlify (para producción).
4. Cambiar `MOCK_MODE` a `false` en `catalogo-mayorista/src/data/store.js`.
5. **Para que el login del admin sea seguridad real:** correr `catalogo-mayorista/supabase/migration-auth.sql` (crea la whitelist de admins y las políticas RLS reales), crear el usuario de Alex en Supabase Auth desde el dashboard, y reemplazar el login hardcodeado de `catalogo-mayorista/src/pages/Admin.jsx` por `supabase.auth.signInWithPassword()`.

### 3.2 Datos de producto incompletos

En `catalogo-mayorista/src/data/products.js`:
- Precios mayoristas: todos en `null` ("a consultar") en todos los formatos de todos los productos — falta definirlos.
- Fichas nutricionales faltantes: Frutos del Bosque y Tocino Merkén.
- Cantidades por bulto (caja de 24 / display de 12) son placeholders sin confirmar.
- Maní dulce/picante mencionados en el brief no existen todavía como producto.

### 3.3 Dominio propio

Hoy el sitio queda en un subdominio `*.netlify.app`. Falta decidir y comprar un dominio propio (ej. algo con "Master Snacks" o "Chitopo") y configurarlo en Netlify — es un trámite de minutos una vez que se elige el dominio, Netlify emite el certificado HTTPS solo.

### 3.4 Otros gaps

- Tipografía del logo sin licencia confirmada (hoy usa alternativas libres de Google Fonts: Baloo 2, Archivo, Anton).
- El script `npm run assets` de `catalogo-mayorista` (regenera íconos/imágenes) depende de la carpeta `Logos vectorizados/`, que queda fuera del repo a propósito — para volver a correrlo hace falta tener esa carpeta localmente, no está disponible en un clone limpio.

## 4. Riesgos / deuda técnica conocida (no bloqueante para el deploy actual)

- Las imágenes de producto en `catalogo-mayorista/src/data/products.js` usan rutas absolutas (`/img/productos/...`). Hoy "funcionan" bajo `/catalogo/` solo porque `landing/public` tiene archivos con los mismos nombres en la raíz del sitio — es un acoplamiento frágil e invisible: se rompe apenas se suba un producto o imagen nueva desde el panel admin que no exista también en `landing/public`. Fix recomendado a futuro: anteponer `import.meta.env.BASE_URL` a esos strings.
- Código duplicado entre `landing/` y `catalogo-mayorista/` (Logo, sello de advertencia, imágenes de producto, favicons, fuentes) — deliberadamente fuera de alcance de la unificación de hoy, candidato a extraer a una carpeta/paquete compartido más adelante.
- Sin tests automatizados en ninguno de los dos proyectos.

## 5. Cómo correr todo localmente

```bash
# Landing (puerto 5174)
cd landing
npm install
npm run dev

# Catálogo + panel admin (puerto 5173)
cd catalogo-mayorista
npm install
npm run dev
```

## 6. Cómo se genera el build de producción

Desde la raíz del repo:

```bash
node build.mjs
```

Compila `landing/` (base `/`) y `catalogo-mayorista/` (base `/catalogo/`), y junta ambos resultados en `dist-site/`. Netlify corre esto automáticamente en cada push a `main` (configurado en `netlify.toml`).
