import { Router } from 'express';
import { 
  obtenerClientes, 
  obtenerClientePorId, 
  crearCliente, 
  actualizarCliente, 
  eliminarCliente,
  alternarEstadoCliente
} from '../controladores/clientes.controlador';
import { verificarToken, vendedorOAdmin } from '../middleware/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken, vendedorOAdmin);

router.get('/', obtenerClientes);
router.get('/:id', obtenerClientePorId);
router.post('/', crearCliente);
router.put('/:id', actualizarCliente);
router.delete('/:id', eliminarCliente);
router.patch('/:id/estado', alternarEstadoCliente);

export default router;
