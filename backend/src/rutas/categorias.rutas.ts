import { Router } from 'express';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../controladores/categorias.controlador';
import { authenticate, adminOnly } from '../middleware/autenticacion';

const router = Router();

router.use(authenticate);

router.get('/', getCategorias);
router.post('/', adminOnly, createCategoria);
router.put('/:id', adminOnly, updateCategoria);
router.delete('/:id', adminOnly, deleteCategoria);

export default router;
