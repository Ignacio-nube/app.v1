import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  getLowStockProducts
} from '../controladores/productos.controlador';
import { authenticate, stockOrAdmin } from '../middleware/autenticacion';

const router = Router();

router.use(authenticate);

router.get('/', getProducts);
router.get('/stock-bajo', getLowStockProducts);
router.get('/:id', getProductById);

router.post('/', stockOrAdmin, createProduct);
router.put('/:id', stockOrAdmin, updateProduct);

export default router;
