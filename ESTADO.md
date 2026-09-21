# Estado del proyecto — Chitopo

Última actualización: 2026-09-17

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
- Pedidos: al tocar "Enviar por WhatsApp" el pedido se guarda en Supabase como **nuevo**, con un código (`CH-XXXX`) que también va en el mensaje. En el panel los dueños lo avanzan: nuevo → pendiente (cotización enviada) → confirmado → enviado, o cancelado. Esto funciona apenas hay credenciales de Supabase, aunque `MOCK_MODE` siga en `true`. Límite: se registra al abrir WhatsApp; si el local no aprieta enviar, queda un "nuevo" sin mensaje, y se cancela desde el panel.
- Catálogo y panel admin con la misma identidad visual que la landing (dorado con damero, tarjetas crema con borde café, Anton, estallido de chitopos con GSAP). Los tokens y utilidades de marca viven en un solo archivo, `shared/chitopo-brand.css`, que importan las dos apps: un cambio de color o tipografía se hace ahí y aplica a ambas.
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
