import { Router } from 'express';
import { 
  obtenerDashboard,
  reporteClientesMorosos,
  reporteVentas,
  reporteInventario,
  reporteFlujo
} from '../controladores/reportes.controlador';
import { verificarToken } from '../middleware/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get('/dashboard', obtenerDashboard);
router.get('/morosos', reporteClientesMorosos);
router.get('/ventas', reporteVentas);
router.get('/inventario', reporteInventario);
router.get('/flujo', reporteFlujo);

export default router;
