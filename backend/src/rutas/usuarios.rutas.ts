import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  obtenerPerfiles
} from '../controladores/usuarios.controlador';
import { authenticate, adminOnly } from '../middleware/autenticacion';

const router = Router();

router.put('/:id', authenticate, updateUser);

router.use(authenticate, adminOnly);

router.get('/', getUsers);
router.get('/perfiles', obtenerPerfiles);
router.get('/:id', getUserById);
router.post('/', createUser);
router.delete('/:id', deleteUser);

export default router;
