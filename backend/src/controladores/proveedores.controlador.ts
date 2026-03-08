import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { Proveedor, ProveedorCrear, ProveedorActualizar } from '../tipos/proveedor.types';

export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const values: any[] = [];

    if (busqueda) {
      where += ` AND (nombre_prov LIKE ? OR contacto_prov LIKE ? OR direccion_prov LIKE ?)`;
      const searchTerm = `%${busqueda}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    const [totalResult] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total FROM PROVEEDORES WHERE ${where}`,
      values
    );
    const total = totalResult[0].total;

    const query = `
      SELECT * FROM PROVEEDORES
      WHERE ${where}
      ORDER BY nombre_prov ASC
      LIMIT ? OFFSET ?
    `;
    values.push(Number(limit), Number(offset));

    const [suppliers] = await pool.query<Proveedor[]>(query, values);

    res.json({
      data: suppliers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [suppliers] = await pool.query<Proveedor[]>(
      'SELECT * FROM PROVEEDORES WHERE id_proveedor = ?',
      [id]
    );

    if (suppliers.length === 0) {
      res.status(404).json({ error: 'Proveedor no encontrado' });
      return;
    }

    res.json(suppliers[0]);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: ProveedorCrear = req.body;

    if (!data.nombre_prov) {
      res.status(400).json({ error: 'El nombre del proveedor es obligatorio' });
      return;
    }

    const [inserted] = await pool.query<Proveedor[]>(
      'INSERT INTO PROVEEDORES (nombre_prov, contacto_prov, direccion_prov, estado_prov) VALUES (?, ?, ?, ?) RETURNING *',
      [data.nombre_prov, data.contacto_prov || null, data.direccion_prov || null, data.estado_prov || 'Activo']
    );

    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data: ProveedorActualizar = req.body;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre_prov !== undefined) { fields.push('nombre_prov = ?'); values.push(data.nombre_prov); }
    if (data.contacto_prov !== undefined) { fields.push('contacto_prov = ?'); values.push(data.contacto_prov); }
    if (data.direccion_prov !== undefined) { fields.push('direccion_prov = ?'); values.push(data.direccion_prov); }
    if (data.estado_prov !== undefined) { fields.push('estado_prov = ?'); values.push(data.estado_prov); }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    values.push(id);

    const [, meta] = await pool.query<any[]>(
      `UPDATE PROVEEDORES SET ${fields.join(', ')} WHERE id_proveedor = ?`,
      values
    );

    if (!meta.rowCount) {
      res.status(404).json({ error: 'Proveedor no encontrado' });
      return;
    }

    res.json({ mensaje: 'Proveedor actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [, meta] = await pool.query<any[]>(
      "UPDATE PROVEEDORES SET estado_prov = 'Inactivo' WHERE id_proveedor = ?",
      [id]
    );

    if (!meta.rowCount) {
      res.status(404).json({ error: 'Proveedor no encontrado' });
      return;
    }

    res.json({ mensaje: 'Proveedor desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
