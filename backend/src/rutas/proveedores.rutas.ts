import { Router } from 'express';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controladores/proveedores.controlador';
import { authenticate, adminOnly } from '../middleware/autenticacion';

const router = Router();

router.use(authenticate);

router.get('/', getSuppliers);
router.get('/:id', getSupplierById);
router.post('/', adminOnly, createSupplier);
router.put('/:id', adminOnly, updateSupplier);
router.delete('/:id', adminOnly, deleteSupplier);

export default router;
