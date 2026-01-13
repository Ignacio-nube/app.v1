## Vision general
- Monorepo con backend Express/TypeScript y frontend React/Vite con Chakra UI.
- Backend expone API REST con prefijo opcional /api, protegido con middleware de autenticacion.
- Frontend consume la API via Axios, maneja roles y protege rutas en el cliente.

## Backend (./backend)
- Entradas: src/servidor.ts arranca el server en PORT (por defecto 3000) tras verificar conexion a Postgres/Supabase via src/config/baseDatos.ts.
- App: src/app.ts configura helmet, cors (FRONTEND_URL o http://localhost:5173), json, logger simple, health check (/health) y monta rutas con y sin prefijo /api.
- Config BD: src/config/baseDatos.ts usa pg Pool con DATABASE_URL, SSL on, helper que convierte placeholders ? a $1, expone query y getConnection estilo mysql2.
- Rutas: src/rutas/
	- auth.rutas.ts → autenticacion y login.
	- usuarios.rutas.ts → CRUD de usuarios/roles.
	- clientes.rutas.ts → gestion de clientes.
	- productos.rutas.ts → gestion de catalogo/stock.
	- ventas.rutas.ts → ventas y sus detalles.
	- pagos.rutas.ts → pagos y cuotas.
	- reportes.rutas.ts → dashboards y reportes.
	- proveedores.rutas.ts → proveedores y compras.
- Controladores: src/controladores/ con el mismo nombre que la ruta; separan la logica de negocio y queries a BD.
- Middleware: src/middleware/autenticacion.ts para validar JWT/roles.
- Tipos: src/tipos/ define contratos de datos (auth, cliente, producto, proveedor, pago, venta).
- Config runtime: tsconfig.json, package.json (scripts: dev, build, start), dotenv requerido para variables.
- SQL y datos:
	- db.sql: schema principal (PERFIL, USUARIO, LOGIN, CLIENTE, PROVEEDORES, PRODUCTOS, VENTA, DETALLE_VENTA, COMPRA, DETALLE_COMPRA, PAGO_PROVEEDOR, DEVOLUCION_VENTA, DETALLE_DEV_VENTA, TIPOS_PAGO, PAGO, CUOTAS).
	- datos-prueba.sql / insertar.sql: seeds.
	- migrations/01_add_usuario_to_venta.sql: migracion incremental.
	- crear-admin.ts: script para crear usuario admin por CLI.

### Flujo de inicio
1) dotenv carga variables.
2) verificarConexion() a Postgres; si falla, se aborta.
3) app.listen() arranca y loguea puerto/entorno.

### Variables de entorno clave
- PORT (opcional), DATABASE_URL (obligatoria, cadena Postgres con SSL), FRONTEND_URL para CORS, NODE_ENV.

## Frontend (./frontend)
- Stack: React 19 + TypeScript, Vite, Chakra UI, React Router 7, React Query, Recharts, Axios.
- Entrada: src/main.tsx monta ColorModeScript, ChakraProvider con theme personalizado (theme/index.ts), QueryClientProvider y BrowserRouter.
- App: src/App.tsx define rutas:
	- /login publico.
	- Resto bajo ProtectedRoute (requiere auth). Layout con ErrorBoundary.
	- /dashboard principal; /usuarios solo Administrador; /clientes y /ventas /pagos para Administrador o Vendedor; /proveedores para Administrador o Encargado de Stock; /productos y /configuracion sin restriccion adicional; / redirige a /dashboard.
- Componentes destacados: modales de gestion (ClienteModal, ProductoModal, ProveedorModal, UsuarioModal, NuevaVentaModal, RegistrarPagoModal), ReporteDashboard, Pagination, ProtectedRoute, Layout, ErrorBoundary, ComprobantePago.
- Contextos y hooks: contexts/AuthContext maneja sesion/roles; hooks/useDebounce y usePagination para UI.
- API client: config/api.ts centraliza Axios (usa VITE_API_URL en .env).
- Estilos: src/index.css y src/App.css; tema en src/theme.
- Scripts package.json: dev, build (tsc -b + vite build), lint, preview.
- Variables de entorno: VITE_API_URL apuntando al backend.

## Datos y base de datos
- Esquema definido en backend/db.sql con claves foraneas y eliminacion en cascada en detalles de ventas/compras.
- Tipos de pago (TIPOS_PAGO) referenciados por PAGO; CUOTAS vincula VENTA y PAGO (ON DELETE SET NULL en id_pago).
- Productos referencian proveedor; ventas y compras cargan detalles en tablas DETALLE_*.

## Operacion rapida
- Backend: cd backend && npm install && npm run dev (requiere DATABASE_URL y PORT opcional).
- Frontend: cd frontend && npm install && npm run dev (requiere VITE_API_URL apuntando al backend).
- Health check backend: GET http://localhost:3000/health.
