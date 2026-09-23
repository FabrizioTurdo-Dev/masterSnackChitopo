# Estado del proyecto — Master Snacks (Chitopo y las marcas que vengan)

Última actualización: 2026-09-22

## 1. Resumen

**Master Snacks** (Master Snacks Inversiones SpA) es la empresa. **Chitopo** es su marca de
horneados; después vendrán otras marcas de productos no horneados. El sitio refleja eso:

Un solo repositorio con dos apps React + Vite independientes, desplegadas juntas en un solo sitio de Netlify:

- **`landing/`** — sitio de marketing con dos páginas (Vite multi-page):
  - `/` — home de **Master Snacks**: la empresa, sus marcas, historia, fábrica, FAQ y contacto.
  - `/chitopo/` — página de **Chitopo**: sabores, por qué elegirlo, Instagram, y una franja que
    lleva a la empresa.
- **`catalogo-mayorista/`** — catálogo B2B de Master Snacks con carrito, pedido derivado a WhatsApp, y panel de administración. Cada producto tiene su marca.

En producción quedan bajo el mismo dominio: la home en `/`, Chitopo en `/chitopo/` y el catálogo en `/catalogo/`.

- Repo: https://github.com/FabrizioTurdo-Dev/masterSnackChitopo
- Link de producción: **completar acá una vez conectado el sitio en Netlify**

## 2. Qué está hecho y funcionando

- Landing completa en dos páginas (home de Master Snacks y página de Chitopo), animaciones (GSAP + Lenis), responsive.
- Catálogo: browse de productos, filtros, carrito, pedido derivado a WhatsApp. El filtro por marca aparece solo cuando hay productos de más de una marca; si un pedido las mezcla, el mensaje las agrupa.
- Pedidos: al tocar "Enviar por WhatsApp" el pedido se guarda en Supabase como **nuevo**, con un código (`MS-XXXX`; los anteriores al cambio de marca quedaron con `CH-XXXX`) que también va en el mensaje. En el panel los dueños lo avanzan: nuevo → pendiente (cotización enviada) → confirmado → enviado, o cancelado. Esto funciona apenas hay credenciales de Supabase, aunque `MOCK_MODE` siga en `true`. Límite: se registra al abrir WhatsApp; si el local no aprieta enviar, queda un "nuevo" sin mensaje, y se cancela desde el panel.
- Dos identidades visuales compartidas por las dos apps en `shared/marca/`:
  - **Master Snacks** (home, catálogo y panel): los colores del logo — amarillo, azul eléctrico, azul rey y contorno negro — con trama de puntos de cómic.
  - **Chitopo** (`/chitopo/` y su tarjeta en la home): dorado con damero, café y rojo.

  Cada página elige con `data-brand` en su `<html>` (o en un bloque, para las "islas" de otra marca). Los datos de la empresa y de cada marca viven en `src/data/brands.js` de cada app (espejo uno del otro).
- Panel de admin (`/catalogo/#/admin`): dashboard, CRUD de productos, listado de pedidos, configuración de tienda — todo funcional en UI.
- Login del panel con **Supabase Auth** (email + contraseña, sesión persistente, cerrar sesión): ya no hay credenciales hardcodeadas en el bundle. Falta conectar el proyecto de Supabase para que tenga contra qué autenticar.
- Infra: repo unificado, build combinado (`build.mjs`) que compila ambas apps y las publica bajo un mismo dominio, `netlify.toml` con el redirect necesario para el panel admin.
- **Modo actual: `MOCK_MODE = true`** (`catalogo-mayorista/src/data/store.js`) — el catálogo y el panel admin trabajan con datos en memoria (`src/data/products.js`). Nada de lo que se edite en el panel admin persiste: se pierde al recargar la página.

## 3. Pendientes críticos para "terminar"

### 3.1 Conexión real a Supabase (base de datos + auth del admin)

El proyecto de Supabase ya está creado, **en la cuenta del cliente (Master Snacks)**. El
código del front ya está escrito: falta correr el SQL y cargar las credenciales.

Pasos, en orden:

1. **SQL Editor de Supabase**, uno detrás del otro:
   `catalogo-mayorista/supabase/schema.sql` → `seed.sql` → `migration-auth.sql` →
   `migration-pedidos.sql`.
   Antes de correr el último, editar adentro la lista de emails con acceso (hoy son dos
   placeholders: Alex y Fabrizio).

   **Si la base ya existía antes del 2026-09-22**, correr también
   `migration-marcas.sql` (agrega la columna `brand` a los productos) **antes** de volver a
   correr `seed.sql` y antes de poner `MOCK_MODE` en `false`. Sin esa columna, crear o
   editar productos desde el panel falla con "column brand does not exist". En una base
   nueva no hace falta: `schema.sql` ya la trae.
2. **Authentication → Providers → Email**: desactivar *Enable email signups*.
3. **Authentication → Users → Add user**: crear a mano la cuenta de Alex y la de Fabrizio,
   con los mismos emails que se pusieron en `migration-auth.sql`. Cada uno elige su propia
   contraseña; no se comparte una sola cuenta.
4. **Project Settings → API**: copiar URL y publishable key a
   `catalogo-mayorista/.env.local` y a las variables de entorno del sitio en Netlify.
5. Probar el login: entrar al panel, recargar (la sesión se mantiene), cerrar sesión.
   Después mandar un pedido de prueba desde el catálogo y revisar que aparezca en Pedidos
   como "nuevo".
6. **Todavía no poner `MOCK_MODE` en `false`.** El catálogo público lee los productos del
   estado en memoria, no de Supabase: con el flag apagado los visitantes verían el catálogo
   vacío. Falta una etapa de código: que el catálogo cargue los productos desde la base y
   que el panel de configuración persista. Los pedidos ya no dependen de este flag: van a
   Supabase en cuanto están las credenciales.

Qué protege qué, para tenerlo claro:

- El login del panel decide **qué se muestra**. Es UX.
- Las políticas RLS de `migration-auth.sql` deciden **qué se puede escribir**, y son la
  barrera real: después de correrlas, la base solo acepta escrituras de sesiones cuyo email
  esté en la tabla `admins`. Cualquier otro intento — con la anon key, desde la consola del
  navegador, rearmando la interfaz — recibe `row-level security policy` y nada más.
- La `service_role` key de Supabase nunca va al front, al repo ni a Netlify.

Quién tiene acceso: Alex (dueño) y Fabrizio (desarrollo), una cuenta cada uno. Se da de baja
a alguien borrando su usuario en Authentication → Users y su fila en `admins`.

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
- El registro de marcas (`src/data/brands.js`) está duplicado en las dos apps y puede desincronizarse; `npm run seed:sql` al menos valida que cada producto use una marca conocida. Sumar una marca es un cambio de código (brands.js en las dos apps, su logo en `BrandMark.jsx` y, si trae líneas o sabores nuevos, `store.js`), no de base de datos.
- Las líneas (suflés, maní, aros) y los sabores son hoy los de Chitopo. Cuando llegue la marca no horneada habrá que sumar los suyos.
- A confirmar con los dueños: si Master Snacks tiene Instagram propio (hoy la home enlaza el de Chitopo como marca) y si son dueños de mastersnackschile.com (el link se sacó del footer; el dominio podría apuntar a este sitio).
- Sin tests automatizados en ninguno de los dos proyectos.

## 5. Cómo correr todo localmente

```bash
# Landing (puerto 5174): / es Master Snacks y /chitopo/ (con barra) es Chitopo
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
