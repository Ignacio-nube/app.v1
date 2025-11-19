import { Router } from 'express';
import { 
  obtenerUsuarios, 
  obtenerUsuarioPorId, 
  crearUsuario, 
  actualizarUsuario, 
  eliminarUsuario,
  obtenerPerfiles 
} from '../controladores/usuarios.controlador';
import { verificarToken, soloAdministrador } from '../middleware/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación y rol de Administrador
router.use(verificarToken, soloAdministrador);

router.get('/', obtenerUsuarios);
router.get('/perfiles', obtenerPerfiles);
router.get('/:id', obtenerUsuarioPorId);
router.post('/', crearUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

export default router;
