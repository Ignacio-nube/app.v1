# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sales management system (Sistema de Ventas) for "Mueblería Centro Hogar". Monorepo with:
- **`backend/`** — Express + TypeScript REST API backed by PostgreSQL (Supabase)
- **`frontend/`** — React 19 + TypeScript + Vite + Chakra UI v2 SPA
- Deployed to Vercel (backend as serverless function, frontend as static build)

## Commands

### Backend
```bash
cd backend
npm run dev      # ts-node-dev with hot reload
npm run build    # tsc → dist/
npm start        # node dist/servidor.js
```

### Frontend
```bash
cd frontend
npm run dev      # Vite dev server (port 5173), proxies /api → localhost:3000
npm run build    # tsc -b && vite build
npm run lint     # eslint
npm run preview  # serve built dist/
```

### Health check
```
GET http://localhost:3000/health
GET http://localhost:3000/api/health
```

## Environment Variables

**Backend** (`.env` in `backend/`):
- `DATABASE_URL` — required; Postgres connection string (Supabase with SSL)
- `JWT_SECRET` — JWT signing secret
- `PORT` — optional, defaults to 3000
- `FRONTEND_URL` — added to CORS allowed origins
- `NODE_ENV`, `ADMIN_PASSWORD`

**Frontend** (`.env` in `frontend/`):
- No `VITE_API_URL` needed — the client always uses `/api` as base URL, relying on Vite's dev proxy or Vercel routing in production.

## Architecture

### Backend

**Entry points:**
- `src/servidor.ts` — verifies DB connection then calls `app.listen()`; aborts if DB fails
- `api/index.ts` — re-exports `app` for Vercel serverless

**App setup (`src/app.ts`):**
- Helmet + CORS (allows `ignacio.cloud` and `vercel.app` subdomains in addition to `FRONTEND_URL`)
- Every route is mounted twice: with and without `/api` prefix (e.g. `['/api/clientes', '/clientes']`)
- Global 404 and error handlers at the bottom

**Database (`src/config/baseDatos.ts`):**
- `pg` Pool with SSL (disabled only for localhost)
- `pool.query(sql, params)` returns a **`[rows, result]` tuple** (mysql2-style wrapper)
- Queries may use `?` placeholders — they are auto-converted to `$1, $2, ...` via `parametrizar()`
- `getConnection()` returns a transaction-aware client with `beginTransaction/commit/rollback/release`

**Auth (`src/middleware/autenticacion.ts`):**
- `verificarToken` — validates `Authorization: Bearer <token>`, attaches `req.usuario` (type `JWTPayload`)
- Role helpers: `soloAdministrador`, `vendedorOAdmin`, `encargadoStockOAdmin`
- Three roles: `Administrador`, `Vendedor`, `Encargado de Stock`

**Route/controller pattern:**
Each domain has a `src/rutas/<name>.rutas.ts` that wires HTTP verbs to handlers in `src/controladores/<name>.controlador.ts`. Types are defined in `src/tipos/`.

**DB schema:** `backend/db.sql` (canonical schema) / `backend/estructura.sql` (used by `/api/setup-db`). Migrations in `backend/migrations/`. Seeds in `datos-prueba.sql` / `insertar.sql`.

### Frontend

**Bootstrap (`src/main.tsx`):** `ChakraProvider` (custom theme from `src/theme/`) + `QueryClientProvider` + `BrowserRouter`.

**Auth flow (`src/contexts/AuthContext.tsx`):**
- Session stored in `localStorage` (`token` + `usuario` keys)
- On init, verifies stored token via `GET /api/auth/verificar`
- 401 responses in the Axios interceptor (`src/config/api.ts`) redirect to `/login` and clear storage

**Routing (`src/App.tsx`):**
- `/login` is public
- All other routes wrapped in `<ProtectedRoute>` → `<Layout>` → `<ErrorBoundary>`
- Role-gated routes: `/usuarios` (Administrador only); `/clientes`, `/ventas`, `/pagos` (Administrador or Vendedor); `/proveedores` (Administrador or Encargado de Stock)

**API client (`src/config/api.ts`):** Single Axios instance with `baseURL: '/api'`, auto-attaches JWT from localStorage.

**Key components:** `NuevaVentaModal`, `RegistrarPagoModal`, `ClienteModal`, `ProductoModal`, `ProveedorModal`, `UsuarioModal`, `ReporteDashboard`, `ComprobantePago`, `Pagination`.

### Vercel Deployment

`vercel.json` routes `/api/*` to `backend/api/index.ts` (Node serverless) and all other paths to the frontend static build.
