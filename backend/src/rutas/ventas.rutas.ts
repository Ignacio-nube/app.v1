import { Router } from 'express';
import { 
  crearVenta, 
  obtenerVentas, 
  obtenerVentaPorId 
} from '../controladores/ventas.controlador';
import { verificarToken, vendedorOAdmin } from '../middleware/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken, vendedorOAdmin);

router.get('/', obtenerVentas);
router.get('/:id', obtenerVentaPorId);
router.post('/', crearVenta);

export default router;
