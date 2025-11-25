import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { Proveedor, ProveedorCrear, ProveedorActualizar } from '../tipos/proveedor.types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Obtener todos los proveedores con paginación y búsqueda
export const obtenerProveedores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '1=1';
    const valores: any[] = [];

    if (busqueda) {
      whereClause += ` AND (nombre_prov LIKE ? OR contacto_prov LIKE ? OR direccion_prov LIKE ?)`;
      const busquedaParam = `%${busqueda}%`;
      valores.push(busquedaParam, busquedaParam, busquedaParam);
    }

    // Obtener total
    const [totalResult] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM PROVEEDORES WHERE ${whereClause}`,
      valores
    );
    const total = totalResult[0].total;

    // Obtener datos paginados
    const query = `
      SELECT * FROM PROVEEDORES 
      WHERE ${whereClause}
      ORDER BY nombre_prov ASC
      LIMIT ? OFFSET ?
    `;
    valores.push(Number(limit), Number(offset));

    const [proveedores] = await pool.query<RowDataPacket[]>(query, valores);

    res.json({
      data: proveedores,
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

// Obtener proveedor por ID
export const obtenerProveedorPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [proveedores] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM PROVEEDORES WHERE id_proveedor = ?',
      [id]
    );

    if (proveedores.length === 0) {
      res.status(404).json({ error: 'Proveedor no encontrado' });
      return;
    }

    res.json(proveedores[0]);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Crear proveedor
export const crearProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const datos: ProveedorCrear = req.body;

    if (!datos.nombre_prov) {
      res.status(400).json({ error: 'El nombre del proveedor es obligatorio' });
      return;
    }

    const [resultado] = await pool.query<ResultSetHeader>(
      'INSERT INTO PROVEEDORES (nombre_prov, contacto_prov, direccion_prov, estado_prov) VALUES (?, ?, ?, ?)',
      [datos.nombre_prov, datos.contacto_prov || null, datos.direccion_prov || null, datos.estado_prov || 'Activo']
    );

    const nuevoProveedor: Proveedor = {
      id_proveedor: resultado.insertId,
      nombre_prov: datos.nombre_prov,
      contacto_prov: datos.contacto_prov || null,
      direccion_prov: datos.direccion_prov || null,
      estado_prov: datos.estado_prov || 'Activo'
    };

    res.status(201).json(nuevoProveedor);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Actualizar proveedor
export const actualizarProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const datos: ProveedorActualizar = req.body;

    const [resultado] = await pool.query<ResultSetHeader>(
      'UPDATE PROVEEDORES SET ? WHERE id_proveedor = ?',
      [datos, id]
    );

    if (resultado.affectedRows === 0) {
      res.status(404).json({ error: 'Proveedor no encontrado' });
      return;
    }

    res.json({ message: 'Proveedor actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Eliminar proveedor (Borrado lógico)
export const eliminarProveedor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query<ResultSetHeader>(
      'UPDATE PROVEEDORES SET estado_prov = "Inactivo" WHERE id_proveedor = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      res.status(404).json({ error: 'Proveedor no encontrado' });
      return;
    }

    res.json({ message: 'Proveedor desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
