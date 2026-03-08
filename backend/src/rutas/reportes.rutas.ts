import { Router } from 'express';
import {
  getDashboard,
  reporteClientesMorosos,
  reporteVentas,
  reporteInventario,
  reporteFlujo,
  obtenerMejoresVendedores
} from '../controladores/reportes.controlador';
import { authenticate, adminOnly } from '../middleware/autenticacion';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/mejores-vendedores', adminOnly, obtenerMejoresVendedores);
router.get('/morosos', reporteClientesMorosos);
router.get('/ventas', reporteVentas);
router.get('/inventario', reporteInventario);
router.get('/flujo', reporteFlujo);

export default router;
