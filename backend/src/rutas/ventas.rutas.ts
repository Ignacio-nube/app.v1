import { Router } from 'express';
import { createSale, getSales, getSaleById } from '../controladores/ventas.controlador';
import { authenticate, salesOrAdmin } from '../middleware/autenticacion';

const router = Router();

router.use(authenticate, salesOrAdmin);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', createSale);

export default router;
