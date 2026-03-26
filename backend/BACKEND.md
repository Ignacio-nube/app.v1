# Backend — Sistema de Ventas Cetrohogar

Express + TypeScript REST API backed by PostgreSQL (Supabase), deployed as a Vercel serverless function.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Language | TypeScript (strict) |
| Database | PostgreSQL via `pg` pool (Supabase) |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Deployment | Vercel serverless (`api/index.ts`) |

---

## Directory Structure

```
backend/
├── api/
│   └── index.ts          # Vercel serverless entry — re-exports app
├── src/
│   ├── app.ts            # Express app setup (CORS, middleware, routes)
│   ├── servidor.ts       # Local dev entry — verifies DB, calls app.listen()
│   ├── config/
│   │   └── baseDatos.ts  # pg Pool + query wrapper + transaction helper
│   ├── middleware/
│   │   └── autenticacion.ts  # JWT verification + role guards
│   ├── rutas/            # One file per domain, wires HTTP verbs → controllers
│   ├── controladores/    # Business logic + DB queries
│   ├── tipos/            # Shared TypeScript interfaces
│   └── migrations/       # SQL migration files
├── db.sql                # Canonical DB schema
├── estructura.sql        # Schema used by /api/setup-db endpoint
└── datos-prueba.sql      # Seed data
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Postgres connection string (Supabase with SSL) |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `PORT` | optional | Defaults to 3000 |
| `FRONTEND_URL` | optional | Added to CORS allowed origins |
| `NODE_ENV` | optional | `development` disables CORS enforcement |
| `ADMIN_PASSWORD` | optional | Key for `/api/setup-db`; defaults to `admin123` |

---

## Running Locally

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm run dev            # ts-node-dev with hot reload on port 3000
```

Health check: `GET http://localhost:3000/health`

---

## Database Layer (`src/config/baseDatos.ts`)

The pool wraps `pg` with a **mysql2-style tuple return**:

```typescript
const [rows, result] = await pool.query('SELECT * FROM CLIENTE WHERE id_cliente = ?', [id]);
//     ^^^^           result rows array
//            ^^^^^^  full QueryResult (useful for rowCount, etc.)
```

Key points:
- **`?` placeholders** are auto-converted to `$1, $2, ...` (PostgreSQL syntax) via an internal `parametrizar()` function. You can write either style.
- **SSL** is enabled for all non-localhost connections (required by Supabase).
- **`getConnection()`** returns a transaction-aware client with `.beginTransaction()`, `.commit()`, `.rollback()`, `.release()`.

---

## Authentication & Authorization (`src/middleware/autenticacion.ts`)

Every protected route requires `Authorization: Bearer <token>` in the request header.

| Middleware | Allowed Roles |
|-----------|--------------|
| `authenticate` | Any authenticated user (validates JWT, attaches `req.usuario`) |
| `adminOnly` | `Administrador` |
| `salesOrAdmin` | `Vendedor`, `Administrador` |
| `stockOrAdmin` | `Encargado de Stock`, `Administrador` |

The JWT payload (`req.usuario`) has shape:
```typescript
interface JWTPayload {
  id_usuario: number;
  nombre_usuario: string;
  rol: 'Administrador' | 'Vendedor' | 'Encargado de Stock';
}
```

On 401: token missing, expired, or invalid.
On 403: valid token but insufficient role.

---

## API Endpoints

All routes are mounted with and without the `/api` prefix (e.g. both `/api/clientes` and `/clientes` work). This supports Vercel routing and direct local calls.

### Auth — `/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | None | Login; returns `{ token, usuario }` |
| POST | `/auth/logout` | Any | Logout (stateless — client drops token) |
| GET | `/auth/verificar` | Any | Verify token validity; returns current user |

### Clientes — `/clientes`

All routes require `salesOrAdmin`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/clientes` | Paginated list. Query: `page`, `limit`, `busqueda` (name/surname/DNI) |
| GET | `/clientes/:id` | Single client with debt summary |
| POST | `/clientes` | Create client |
| PUT | `/clientes/:id` | Update client |
| DELETE | `/clientes/:id` | Delete client |
| PATCH | `/clientes/:id/estado` | Toggle Activo ↔ Inactivo |

### Productos — `/productos`

GET endpoints require any authenticated user. Write operations require `stockOrAdmin`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/productos` | Paginated list. Query: `page`, `limit`, `busqueda`, `categoria` |
| GET | `/productos/stock-bajo` | Products below `stock_minimo` |
| GET | `/productos/:id` | Single product |
| POST | `/productos` | Create product (`stockOrAdmin`) |
| PUT | `/productos/:id` | Update product (`stockOrAdmin`) |

### Ventas — `/ventas`

All routes require `salesOrAdmin`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ventas` | Paginated sales list. Query: `page`, `limit` |
| GET | `/ventas/:id` | Single sale with installments |
| POST | `/ventas` | Create sale (generates cuotas automatically for installment sales) |

### Pagos — `/pagos`

All routes require at minimum `authenticate`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/pagos/tipos` | Any | Payment method list (Efectivo, Transferencia, etc.) |
| GET | `/pagos/historial` | Any | Paginated payment history. Query: `page`, `limit`, `busqueda` |
| GET | `/pagos/cuotas` | Any | Paginated installments. Query: `page`, `limit`, `estado` (Pendiente/Vencida), `busqueda` |
| GET | `/pagos/cuotas/venta/:id_venta` | Any | Installments for a specific sale |
| GET | `/pagos/cuotas/cliente/:id_cliente` | Any | Installments for a specific client |
| POST | `/pagos/cuotas/actualizar-vencidas` | Admin | Mark past-due installments as Vencida |
| POST | `/pagos` | salesOrAdmin | Register a payment for one or more installments |

### Proveedores — `/proveedores`

GET requires any authenticated user. Write operations require `adminOnly`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/proveedores` | Paginated list. Query: `page`, `limit`, `busqueda` |
| GET | `/proveedores/:id` | Single supplier |
| POST | `/proveedores` | Create supplier (`adminOnly`) |
| PUT | `/proveedores/:id` | Update supplier (`adminOnly`) |
| DELETE | `/proveedores/:id` | Delete supplier (`adminOnly`) |

### Usuarios — `/usuarios`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/usuarios` | Admin | All users |
| GET | `/usuarios/perfiles` | Admin | Available roles/profiles |
| GET | `/usuarios/:id` | Admin | Single user |
| POST | `/usuarios` | Admin | Create user |
| PUT | `/usuarios/:id` | Any (own profile) | Update user |
| DELETE | `/usuarios/:id` | Admin | Delete user |

### Reportes — `/reportes`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/reportes/dashboard` | Any | Dashboard KPIs (sales, revenue, overdue) |
| GET | `/reportes/mejores-vendedores` | Admin | Top sellers ranking |
| GET | `/reportes/morosos` | Any | Clients with overdue installments |
| GET | `/reportes/ventas` | Any | Sales report with filters |
| GET | `/reportes/inventario` | Any | Inventory status report |
| GET | `/reportes/flujo` | Any | Cash flow report |

### Backup — `/backup`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/backup` | Admin | Download full DB as JSON (`Content-Disposition: attachment`). Excludes passwords. |

### System

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Health check + DB connectivity |
| GET | `/api/setup-db?key=<password>` | Key param | Initialize schema + seed admin user |

---

## Roles & Permissions Summary

| Feature | Administrador | Vendedor | Encargado de Stock |
|---------|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Clientes (CRUD) | ✅ | ✅ | ❌ |
| Ventas (CRUD) | ✅ | ✅ | ❌ |
| Pagos | ✅ | ✅ | ❌ |
| Productos (read) | ✅ | ✅ | ✅ |
| Productos (write) | ✅ | ❌ | ✅ |
| Proveedores (read) | ✅ | ❌ | ✅ |
| Proveedores (write) | ✅ | ❌ | ❌ |
| Usuarios (CRUD) | ✅ | ❌ | ❌ |
| Reportes | ✅ | ✅* | ✅* |
| Backup | ✅ | ❌ | ❌ |

*Some report endpoints are admin-only (e.g. mejores-vendedores).

---

## Code Conventions

- **Route files** (`src/rutas/`) only wire HTTP methods to controller functions. No business logic.
- **Controller files** (`src/controladores/`) contain all business logic and DB queries. Return `res.json()` or `res.status().json()`.
- **Error handling**: controllers use try/catch and return appropriate HTTP status codes. Global error middleware in `app.ts` catches anything that slips through.
- **Passwords**: always hashed with `bcryptjs` (10 rounds). Never returned in responses.
- **Pagination**: query params `page` (1-indexed) and `limit`. Response shape: `{ data: [...], pagination: { total, page, limit, totalPages } }`.
- **Soft deletes**: clients use `estado_cliente` (Activo/Inactivo) rather than hard deletes where business logic requires history preservation.
