# Dependencias y Estado del Proyecto

Documentación de dependencias (frontend y backend), variables de entorno y usuarios activos en la base de datos.

---

## Backend — Dependencias (`backend/package.json`)

### Producción (`dependencies`)

| Paquete | Versión | Qué hace | Dónde se usa |
|---|---|---|---|
| `express` | ^4.18.2 | Framework HTTP principal | `src/app.ts`, todas las rutas y controladores |
| `pg` | ^8.13.1 | Driver de PostgreSQL | `src/config/baseDatos.ts` — Pool de conexiones a Supabase |
| `bcryptjs` | ^2.4.3 | Hash de contraseñas | `src/controladores/auth.controlador.ts`, `src/controladores/usuarios.controlador.ts`, `crear-admin.ts` |
| `jsonwebtoken` | ^9.0.2 | Generación y verificación de JWT | `src/controladores/auth.controlador.ts`, `src/middleware/autenticacion.ts` |
| `cors` | ^2.8.5 | Política de origen cruzado (CORS) | `src/app.ts` — permite `localhost`, `ignacio.cloud`, `vercel.app` |
| `helmet` | ^7.1.0 | Headers de seguridad HTTP | `src/app.ts` |
| `dotenv` | ^16.3.1 | Carga variables del archivo `.env` | `src/app.ts`, `src/config/baseDatos.ts`, `src/config/email.ts`, `crear-admin.ts` |
| `nodemailer` | ^8.0.4 | Envío de emails via SMTP | `src/config/email.ts` — solo para recuperación de contraseña |
| `express-validator` | ^7.0.1 | Validación de parámetros en rutas | Disponible pero uso limitado en controladores |

### ⚠️ Dependencias mal ubicadas en backend (nunca se importan en código backend)

Estos paquetes están listados en `backend/package.json` pero **son librerías de frontend** y no se importan en ningún archivo `.ts` del backend. Son probablemente residuos de un copy-paste del `package.json` del frontend:

| Paquete | Problema |
|---|---|
| `axios` | No se usa en backend. Solo se usa en el frontend. |
| `react-icons` | Librería de íconos para React. No aplica al backend. |
| `react-router-dom` | Router de React. No aplica al backend. |
| `zustand` | Estado global para React. No aplica al backend. |
| `@types/nodemailer` | Debería estar en `devDependencies`, no en `dependencies`. |

### Dev (`devDependencies`)

| Paquete | Qué hace |
|---|---|
| `typescript` | Compilador TypeScript |
| `ts-node-dev` | Ejecuta TypeScript en dev con hot reload (`npm run dev`) |
| `@types/express`, `@types/cors`, `@types/bcryptjs`, `@types/jsonwebtoken`, `@types/node`, `@types/pg` | Tipos TypeScript para las dependencias de producción |

---

## Frontend — Dependencias (`frontend/package.json`)

### Producción (`dependencies`)

| Paquete | Versión | Qué hace | Dónde se usa |
|---|---|---|---|
| `react` + `react-dom` | ^19.2.0 | Framework UI principal | Todo el frontend |
| `react-router-dom` | ^7.9.6 | Enrutamiento SPA | `src/App.tsx`, `src/components/ProtectedRoute.tsx` |
| `axios` | ^1.13.2 | Cliente HTTP | `src/config/api.ts` — instancia única con interceptores de JWT y 401 |
| `@chakra-ui/react` + `@chakra-ui/icons` | ^2.10.9 / ^2.2.4 | Sistema de componentes UI | Todos los componentes y páginas |
| `@emotion/react` + `@emotion/styled` | ^11.x | CSS-in-JS (requerido por Chakra UI v2) | Peer dependency de Chakra |
| `framer-motion` | ^12.x | Animaciones (requerido por Chakra UI v2) | Peer dependency de Chakra, usado en modales y transiciones |
| `@tanstack/react-query` | ^5.90.9 | Cache y sincronización de estado del servidor | `src/main.tsx` (`QueryClientProvider`); disponible para fetch en páginas |
| `react-icons` | ^5.5.0 | Íconos SVG (colecciones Fi, Bi, etc.) | Layouts, modales, páginas — íconos de nav y acciones |
| `recharts` | ^3.4.1 | Gráficos y reportes | `src/components/ReporteDashboard.tsx` — gráficos de ventas y pagos |

### Dev (`devDependencies`)

| Paquete | Qué hace |
|---|---|
| `vite` + `@vitejs/plugin-react-swc` | Bundler + compilación rápida con SWC |
| `typescript` | Compilador TypeScript |
| `eslint` + plugins | Linting (`npm run lint`) |
| `@types/react`, `@types/react-dom`, `@types/node` | Tipos TypeScript |

---

## Variables de Entorno — Estado Actual

### `backend/.env`

| Variable | Estado | Descripción |
|---|---|---|
| `DATABASE_URL` | ✅ Activa | Conexión a Supabase (pool.supabase.com, puerto 6543 — pooler) |
| `JWT_SECRET` | ✅ Activa | Secreto para firmar tokens JWT |
| `PORT` | ✅ Activa | Puerto local del servidor (3000) |
| `FRONTEND_URL` | ⚠️ Solo dev | `http://localhost:5173` — en producción Vercel no usa esta variable |
| `ADMIN_PASSWORD` | ✅ Activa | Clave para proteger el endpoint `GET /api/setup-db?key=...` |
| `ADMIN_USER` | ⚠️ Solo script | Solo leída por `crear-admin.ts`, no por la app principal |
| `ADMIN_PROFILE_ID` | ⚠️ Solo script | Solo leída por `crear-admin.ts`, no por la app principal |
| `SMTP_HOST` | ✅ Activa | `smtp.gmail.com` — para emails de reset de contraseña |
| `SMTP_PORT` | ✅ Activa | `587` (TLS) |
| `SMTP_USER` | ✅ Activa | Cuenta Gmail remitente |
| `SMTP_PASS` | ✅ Activa | App Password de Google (16 caracteres con espacios) |
| `SMTP_FROM` | ✅ Activa | Nombre y dirección del remitente en los emails |

### `frontend/.env`

| Variable | Estado | Descripción |
|---|---|---|
| `VITE_API_URL` | ❌ **No se usa** | `src/config/api.ts` hardcodea `'/api'` directamente. Esta variable está definida pero nunca leída en el código. |

---

## Usuarios en Base de Datos (estado actual)

| ID | Usuario | Rol | Email |
|---|---|---|---|
| 1 | `admin` | Administrador | nacho.marquez@gmail.com |
| 2 | `vendedor` | Vendedor | — |
| 4 | `stock` | Encargado de Stock | — |
| 5 | `nacho` | Encargado de Stock | — |
| 6 | `virginia` | Vendedor | mariavirg2010@hotmail.com |

> La recuperación de contraseña por email solo funciona para `admin` y `virginia` ya que son los únicos con email configurado.
> La tabla `USUARIO` **no tiene columna `activo`** — todos los usuarios registrados pueden iniciar sesión.

---

## Tablas activas en Supabase

Todas las tablas existen y están operativas. Las que tienen datos de producción:

| Tabla | Filas |
|---|---|
| `perfil` | 3 |
| `usuario` | 5 |
| `login` | 36 |
| `cliente` | 23 |
| `proveedores` | 7 |
| `productos` | 21 |
| `categorias` | 5 |
| `venta` | 26 |
| `detalle_venta` | 42 |
| `pago` | 38 |
| `cuotas` | 87 |
| `tipos_pago` | 4 |

Las tablas `compra`, `detalle_compra`, `pago_proveedor`, `devolucion_venta`, `detalle_dev_venta` existen en el schema pero **no tienen datos** — son funcionalidades definidas en el DB pero no implementadas en la app.
