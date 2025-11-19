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

// Rutas públicas para usuarios autenticados (para editar su propio perfil)
router.put('/:id', verificarToken, actualizarUsuario);

// Rutas solo para administradores
router.use(verificarToken, soloAdministrador);

router.get('/', obtenerUsuarios);
router.get('/perfiles', obtenerPerfiles);
router.get('/:id', obtenerUsuarioPorId);
router.post('/', crearUsuario);
router.delete('/:id', eliminarUsuario);

export default router;
