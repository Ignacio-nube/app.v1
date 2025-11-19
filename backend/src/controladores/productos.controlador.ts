import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { Producto, ProductoCrear, ProductoActualizar } from '../tipos/producto.types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Obtener todos los productos
export const obtenerProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria, busqueda, soloActivos } = req.query;

    let query = 'SELECT * FROM PRODUCTOS WHERE 1=1';
    const valores: any[] = [];

    if (categoria) {
      query += ' AND categoria = ?';
      valores.push(categoria);
    }

    if (busqueda) {
      query += ' AND (nombre_productos LIKE ? OR descripcion LIKE ?)';
      const busquedaParam = `%${busqueda}%`;
      valores.push(busquedaParam, busquedaParam);
    }

    if (soloActivos === 'true') {
      query += ' AND estado_productos = ?';
      valores.push('Activo');
    }

    query += ' ORDER BY nombre_productos';

    const [productos] = await pool.query<(Producto & RowDataPacket)[]>(query, valores);

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [productos] = await pool.query<(Producto & RowDataPacket)[]>(
      'SELECT * FROM PRODUCTOS WHERE id_productos = ?',
      [id]
    );

    if (productos.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.json(productos[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Crear nuevo producto
export const crearProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const datos: ProductoCrear = req.body;

    // Validar campos requeridos
    if (!datos.nombre_productos || !datos.categoria || datos.stock === undefined || 
        !datos.precio_contado || !datos.precio_credito) {
      res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
      return;
    }

    // Validar categoría
    const categoriasValidas = ['muebles', 'electrodomesticos', 'colchones'];
    if (!categoriasValidas.includes(datos.categoria)) {
      res.status(400).json({ error: 'Categoría inválida' });
      return;
    }

    // Insertar producto
    const [resultado] = await pool.query<ResultSetHeader>(
      `INSERT INTO PRODUCTOS 
        (nombre_productos, descripcion, categoria, stock, precio_contado, precio_credito, estado_productos)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        datos.nombre_productos,
        datos.descripcion || null,
        datos.categoria,
        datos.stock,
        datos.precio_contado,
        datos.precio_credito,
        datos.estado_productos || 'Activo'
      ]
    );

    // Obtener el producto creado
    const [nuevoProducto] = await pool.query<(Producto & RowDataPacket)[]>(
      'SELECT * FROM PRODUCTOS WHERE id_productos = ?',
      [resultado.insertId]
    );

    res.status(201).json(nuevoProducto[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Actualizar producto
export const actualizarProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const datos: ProductoActualizar = req.body;

    // Construir query dinámicamente
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.nombre_productos !== undefined) {
      campos.push('nombre_productos = ?');
      valores.push(datos.nombre_productos);
    }

    if (datos.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(datos.descripcion);
    }

    if (datos.categoria !== undefined) {
      const categoriasValidas = ['muebles', 'electrodomesticos', 'colchones'];
      if (!categoriasValidas.includes(datos.categoria)) {
        res.status(400).json({ error: 'Categoría inválida' });
        return;
      }
      campos.push('categoria = ?');
      valores.push(datos.categoria);
    }

    if (datos.stock !== undefined) {
      campos.push('stock = ?');
      valores.push(datos.stock);
    }

    if (datos.precio_contado !== undefined) {
      campos.push('precio_contado = ?');
      valores.push(datos.precio_contado);
    }

    if (datos.precio_credito !== undefined) {
      campos.push('precio_credito = ?');
      valores.push(datos.precio_credito);
    }

    if (datos.estado_productos !== undefined) {
      campos.push('estado_productos = ?');
      valores.push(datos.estado_productos);
    }

    if (campos.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    valores.push(id);

    const [resultado] = await pool.query<ResultSetHeader>(
      `UPDATE PRODUCTOS SET ${campos.join(', ')} WHERE id_productos = ?`,
      valores
    );

    if (resultado.affectedRows === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    // Obtener producto actualizado
    const [productoActualizado] = await pool.query<(Producto & RowDataPacket)[]>(
      'SELECT * FROM PRODUCTOS WHERE id_productos = ?',
      [id]
    );

    res.json(productoActualizado[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener productos con stock bajo (menos de 10 unidades)
export const obtenerProductosStockBajo = async (req: Request, res: Response): Promise<void> => {
  try {
    const [productos] = await pool.query<(Producto & RowDataPacket)[]>(
      `SELECT * FROM PRODUCTOS 
       WHERE stock < 10 AND estado_productos = 'Activo'
       ORDER BY stock ASC, nombre_productos`
    );

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
