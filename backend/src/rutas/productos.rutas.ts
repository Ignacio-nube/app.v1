import { Router } from 'express';
import { 
  obtenerProductos, 
  obtenerProductoPorId, 
  crearProducto, 
  actualizarProducto,
  obtenerProductosStockBajo
} from '../controladores/productos.controlador';
import { verificarToken, encargadoStockOAdmin } from '../middleware/autenticacion';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Consulta abierta a todos los roles autenticados
router.get('/', obtenerProductos);
router.get('/stock-bajo', obtenerProductosStockBajo);
router.get('/:id', obtenerProductoPorId);

// Creación y actualización solo para Encargado de Stock o Admin
router.post('/', encargadoStockOAdmin, crearProducto);
router.put('/:id', encargadoStockOAdmin, actualizarProducto);

export default router;
