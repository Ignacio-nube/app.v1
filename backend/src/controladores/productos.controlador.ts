import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { Producto, ProductoCrear, ProductoActualizar } from '../tipos/producto.types';

// Obtener todos los productos con paginación
export const obtenerProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria, busqueda, soloActivos, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '1=1';
    const valores: any[] = [];

    if (categoria) {
      whereClause += ' AND categoria = ?';
      valores.push(categoria);
    }

    if (busqueda) {
      whereClause += ' AND (nombre_productos LIKE ? OR descripcion LIKE ?)';
      const busquedaParam = `%${busqueda}%`;
      valores.push(busquedaParam, busquedaParam);
    }

    if (soloActivos === 'true') {
      whereClause += ' AND estado_productos = ?';
      valores.push('Activo');
    }

    // Obtener total
    const [totalResult] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total FROM PRODUCTOS WHERE ${whereClause}`,
      valores
    );
    const total = totalResult[0].total;

    const query = `
      SELECT p.*, pr.nombre_prov 
      FROM PRODUCTOS p
      LEFT JOIN PROVEEDORES pr ON p.id_proveedor = pr.id_proveedor
      WHERE ${whereClause} 
      ORDER BY p.nombre_productos 
      LIMIT ? OFFSET ?
    `;
    valores.push(Number(limit), Number(offset));

    const [productos] = await pool.query<Producto[]>(query, valores);

    res.json({
      data: productos,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [productos] = await pool.query<Producto[]>(
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
    const [insertados] = await pool.query<Producto[]>(
      `INSERT INTO PRODUCTOS 
        (nombre_productos, descripcion, categoria, stock, precio_contado, precio_credito, estado_productos, id_proveedor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        datos.nombre_productos,
        datos.descripcion || null,
        datos.categoria,
        datos.stock,
        datos.precio_contado,
        datos.precio_credito,
        datos.estado_productos || 'Activo',
        datos.id_proveedor || null
      ]
    );
    res.status(201).json(insertados[0]);
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

    if (datos.id_proveedor !== undefined) {
      campos.push('id_proveedor = ?');
      valores.push(datos.id_proveedor);
    }

    if (campos.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    valores.push(id);

    const [, meta] = await pool.query<any[]>(
      `UPDATE PRODUCTOS SET ${campos.join(', ')} WHERE id_productos = ?`,
      valores
    );

    if (!meta.rowCount) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    // Obtener producto actualizado
    const [productoActualizado] = await pool.query<Producto[]>(
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
export const obtenerProductosStockBajo = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [productos] = await pool.query<Producto>(
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
