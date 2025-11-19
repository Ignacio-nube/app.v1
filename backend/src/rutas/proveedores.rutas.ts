import { Router } from 'express';
import {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from '../controladores/proveedores.controlador';
import { verificarToken, soloAdministrador } from '../middleware/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get('/', obtenerProveedores);
router.get('/:id', obtenerProveedorPorId);
router.post('/', soloAdministrador, crearProveedor);
router.put('/:id', soloAdministrador, actualizarProveedor);
router.delete('/:id', soloAdministrador, eliminarProveedor);

export default router;
