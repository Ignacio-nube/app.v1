import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Importar rutas
import authRutas from './rutas/auth.rutas';
import usuariosRutas from './rutas/usuarios.rutas';
import clientesRutas from './rutas/clientes.rutas';
import productosRutas from './rutas/productos.rutas';
import ventasRutas from './rutas/ventas.rutas';
import pagosRutas from './rutas/pagos.rutas';
import reportesRutas from './rutas/reportes.rutas';
import proveedoresRutas from './rutas/proveedores.rutas';

dotenv.config();

const app: Application = express();

// Middleware de seguridad
app.use(helmet());

// Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging simple
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta de health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Sistema de Ventas - Mueblería Centro Hogar'
  });
});

// Montar rutas de la API
const apiRouter = express.Router();
apiRouter.use('/auth', authRutas);
apiRouter.use('/usuarios', usuariosRutas);
apiRouter.use('/clientes', clientesRutas);
apiRouter.use('/productos', productosRutas);
apiRouter.use('/ventas', ventasRutas);
apiRouter.use('/pagos', pagosRutas);
apiRouter.use('/reportes', reportesRutas);
apiRouter.use('/proveedores', proveedoresRutas);

// Registrar el router bajo /api (para local/estándar) y / (para Vercel si se limpia el prefijo)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Ruta 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Middleware de manejo de errores global
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
