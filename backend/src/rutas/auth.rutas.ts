import { Router } from 'express';
import { login, logout, verificarSesion } from '../controladores/auth.controlador';
import { verificarToken } from '../middleware/autenticacion';

const router = Router();

// Rutas públicas
router.post('/login', login);

// Rutas protegidas
router.post('/logout', verificarToken, logout);
router.get('/verificar', verificarToken, verificarSesion);

export default router;
