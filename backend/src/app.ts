import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pool from './config/baseDatos';

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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como curl o apps móviles)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
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
app.get(['/api/health', '/health'], async (_req: Request, res: Response) => {
  const dbStatus = await pool.verificarConexion();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Sistema de Ventas - Mueblería Centro Hogar',
    database: dbStatus,
    env: process.env.NODE_ENV
  });
});

// Ruta de inicialización de Base de Datos (Segura con token o API Key en producción)
app.get('/api/setup-db', async (req: Request, res: Response) => {
  // En producción, permitimos admin123 como fallback si no hay variable de entorno
  const secretKey = req.query.key;
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (secretKey !== adminPass) {
    res.status(401).json({ 
      error: 'No autorizado para ejecutar setup',
      debug: {
        provided: secretKey,
        expectedSet: Boolean(process.env.ADMIN_PASSWORD)
      }
    });
    return;
  }

  try {
    const fs = require('fs');
    const path = require('path');
    
    // Leer el archivo estructura.sql
    // Nota: La ruta puede variar en Vercel, intentamos varias
    let sqlPath = path.join(process.cwd(), 'backend', 'estructura.sql');
    if (!fs.existsSync(sqlPath)) {
      sqlPath = path.join(process.cwd(), 'estructura.sql');
    }
    
    if (!fs.existsSync(sqlPath)) {
      res.status(404).json({ error: 'No se encontró estructura.sql', searched: sqlPath });
      return;
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el SQL completo
    await pool.query(sql);

    // Insertar perfiles básicos si no existen
    await pool.query("INSERT INTO PERFIL (id_perfil, rol) VALUES (1, 'Administrador'), (2, 'Vendedor'), (3, 'Encargado de Stock') ON CONFLICT DO NOTHING");
    
    // Insertar tipos de pago básicos
    await pool.query("INSERT INTO TIPOS_PAGO (descripcion) VALUES ('Efectivo'), ('Transferencia'), ('Tarjeta') ON CONFLICT DO NOTHING");

    // Insertar usuario administrador por defecto si no hay ninguno
    const bcrypt = require('bcryptjs');
    const [usuarios] = await pool.query("SELECT * FROM USUARIO WHERE nombre_usuario = 'admin'");
    if (usuarios.length === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await pool.query(
        "INSERT INTO USUARIO (nombre_usuario, contraseña_usu, id_perfil) VALUES ('admin', ?, 1)",
        [hashedPassword]
      );
      console.log('✅ Admin user created');
    }

    res.json({ mensaje: 'Base de datos inicializada correctamente y usuario admin asegurado' });
  } catch (error: any) {
    console.error('Error en setup-db:', error);
    res.status(500).json({ error: 'Error al inicializar DB', detalles: error.message });
  }
});

// Ruta de depuración para ver variables de entorno (sin secretos)
app.get('/api/debug-env', (_req: Request, res: Response) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    HAS_DB_URL: Boolean(process.env.DATABASE_URL),
    DB_URL_PREFIX: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'none',
    HAS_JWT_SECRET: Boolean(process.env.JWT_SECRET),
    FRONTEND_URL: process.env.FRONTEND_URL,
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME // Solo por curiosidad si se migró de algún lado
  });
});

// Ruta de depuración para ver archivos en el despliegue
app.get('/api/debug-files', (_req: Request, res: Response) => {
  const fs = require('fs');
  const path = require('path');
  
  function getFiles(dir: string, fileList: string[] = []): string[] {
    try {
      const files = fs.readdirSync(dir);
      files.forEach((file: string) => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
          getFiles(name, fileList);
        } else {
          fileList.push(name);
        }
      });
    } catch (e) {
      fileList.push(`Error reading ${dir}: ${e}`);
    }
    return fileList;
  }

  const rootFiles = getFiles(process.cwd());
  res.json({
    cwd: process.cwd(),
    files: rootFiles
  });
});

// Montar rutas de la API (soporta prefijo /api y también rutas sin prefijo)
const withApi = (path: string) => `/api${path}`;

app.use([withApi('/auth'), '/auth'], authRutas);
app.use([withApi('/usuarios'), '/usuarios'], usuariosRutas);
app.use([withApi('/clientes'), '/clientes'], clientesRutas);
app.use([withApi('/productos'), '/productos'], productosRutas);
app.use([withApi('/ventas'), '/ventas'], ventasRutas);
app.use([withApi('/pagos'), '/pagos'], pagosRutas);
app.use([withApi('/reportes'), '/reportes'], reportesRutas);
app.use([withApi('/proveedores'), '/proveedores'], proveedoresRutas);

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
    mensaje: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    tipo: err.constructor.name
  });
});

export default app;
