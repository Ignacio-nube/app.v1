import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/autenticacion';
import { generarBackup } from '../controladores/backup.controlador';

const router = Router();

router.get('/', authenticate, adminOnly, generarBackup);

export default router;
