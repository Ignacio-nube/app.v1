import { Router } from 'express';
import { login, logout, verifySession } from '../controladores/auth.controlador';
import { authenticate } from '../middleware/autenticacion';

const router = Router();

router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/verificar', authenticate, verifySession);

export default router;
