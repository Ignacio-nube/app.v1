import { Router } from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus
} from '../controladores/clientes.controlador';
import { authenticate, salesOrAdmin } from '../middleware/autenticacion';

const router = Router();

router.use(authenticate, salesOrAdmin);

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.patch('/:id/estado', toggleClientStatus);

export default router;
