import { Router } from 'express';
import {
  obtenerTiposPago,
  getPaymentHistory,
  registerPayment,
  obtenerTodasLasCuotas,
  getInstallmentsBySale,
  obtenerCuotasCliente,
  updateOverdueInstallments
} from '../controladores/pagos.controlador';
import { authenticate, salesOrAdmin, adminOnly } from '../middleware/autenticacion';

const router = Router();

router.use(authenticate);

router.get('/tipos', obtenerTiposPago);
router.get('/historial', getPaymentHistory);
router.get('/cuotas', obtenerTodasLasCuotas);
router.get('/cuotas/venta/:id_venta', getInstallmentsBySale);
router.get('/cuotas/cliente/:id_cliente', obtenerCuotasCliente);
router.post('/cuotas/actualizar-vencidas', adminOnly, updateOverdueInstallments);
router.post('/', salesOrAdmin, registerPayment);

export default router;
