import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { Producto, ProductoCrear, ProductoActualizar } from '../tipos/producto.types';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria, busqueda, soloActivos, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const values: any[] = [];

    if (categoria) {
      where += ' AND categoria = ?';
      values.push(categoria);
    }

    if (busqueda) {
      where += ' AND (nombre_productos LIKE ? OR descripcion LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      values.push(searchTerm, searchTerm);
    }

    if (soloActivos === 'true') {
      where += ' AND estado_productos = ?';
      values.push('Activo');
    }

    const [totalResult] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total FROM PRODUCTOS WHERE ${where}`,
      values
    );
    const total = totalResult[0].total;

    const query = `
      SELECT p.*, pr.nombre_prov
      FROM PRODUCTOS p
      LEFT JOIN PROVEEDORES pr ON p.id_proveedor = pr.id_proveedor
      WHERE ${where}
      ORDER BY p.nombre_productos
      LIMIT ? OFFSET ?
    `;
    values.push(Number(limit), Number(offset));

    const [products] = await pool.query<Producto[]>(query, values);

    res.json({
      data: products,
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

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [products] = await pool.query<Producto[]>(
      'SELECT * FROM PRODUCTOS WHERE id_productos = ?',
      [id]
    );

    if (products.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: ProductoCrear = req.body;

    if (!data.nombre_productos || !data.categoria || data.stock === undefined || !data.precio_contado) {
      res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
      return;
    }

    const [catRows] = await pool.query<{ nombre: string }[]>(
      'SELECT nombre FROM CATEGORIAS WHERE nombre = ?',
      [data.categoria]
    );
    if (catRows.length === 0) {
      res.status(400).json({ error: 'Categoría inválida' });
      return;
    }

    const [inserted] = await pool.query<Producto[]>(
      `INSERT INTO PRODUCTOS
        (nombre_productos, descripcion, categoria, stock, precio_contado, estado_productos, id_proveedor)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        data.nombre_productos,
        data.descripcion || null,
        data.categoria,
        data.stock,
        data.precio_contado,
        data.estado_productos || 'Activo',
        data.id_proveedor || null
      ]
    );
    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data: ProductoActualizar = req.body;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre_productos !== undefined) { fields.push('nombre_productos = ?'); values.push(data.nombre_productos); }
    if (data.descripcion !== undefined) { fields.push('descripcion = ?'); values.push(data.descripcion); }

    if (data.categoria !== undefined) {
      const [catRows] = await pool.query<{ nombre: string }[]>(
        'SELECT nombre FROM CATEGORIAS WHERE nombre = ?',
        [data.categoria]
      );
      if (catRows.length === 0) {
        res.status(400).json({ error: 'Categoría inválida' });
        return;
      }
      fields.push('categoria = ?');
      values.push(data.categoria);
    }

    if (data.stock !== undefined) { fields.push('stock = ?'); values.push(data.stock); }
    if (data.precio_contado !== undefined) { fields.push('precio_contado = ?'); values.push(data.precio_contado); }
    if (data.estado_productos !== undefined) { fields.push('estado_productos = ?'); values.push(data.estado_productos); }
    if (data.id_proveedor !== undefined) { fields.push('id_proveedor = ?'); values.push(data.id_proveedor); }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    values.push(id);

    const [, meta] = await pool.query<any[]>(
      `UPDATE PRODUCTOS SET ${fields.join(', ')} WHERE id_productos = ?`,
      values
    );

    if (!meta.rowCount) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const [updated] = await pool.query<Producto[]>(
      'SELECT * FROM PRODUCTOS WHERE id_productos = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getLowStockProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [products] = await pool.query<Producto>(
      `SELECT * FROM PRODUCTOS
       WHERE stock < 10 AND estado_productos = 'Activo'
       ORDER BY stock ASC, nombre_productos`
    );

    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
