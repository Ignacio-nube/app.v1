import { Router } from 'express';
import { login, logout, verifySession, forgotPassword, resetPassword } from '../controladores/auth.controlador';
import { authenticate } from '../middleware/autenticacion';

const router = Router();

router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/verificar', authenticate, verifySession);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
