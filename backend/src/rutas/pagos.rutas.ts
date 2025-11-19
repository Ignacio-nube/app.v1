import { Router } from 'express';
import { 
  obtenerTiposPago,
  registrarPago,
  obtenerCuotasPorVenta,
  obtenerCuotasCliente,
  actualizarCuotasVencidas,
  obtenerTodasLasCuotas
} from '../controladores/pagos.controlador';
import { verificarToken, vendedorOAdmin, soloAdministrador } from '../middleware/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get('/tipos', obtenerTiposPago);
router.post('/', vendedorOAdmin, registrarPago);
router.get('/cuotas', obtenerTodasLasCuotas);
router.get('/cuotas/venta/:id_venta', obtenerCuotasPorVenta);
router.get('/cuotas/cliente/:id_cliente', obtenerCuotasCliente);
router.post('/cuotas/actualizar-vencidas', soloAdministrador, actualizarCuotasVencidas);

export default router;
