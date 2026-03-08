import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { Cliente, ClienteCrear, ClienteActualizar, ClienteConDeuda } from '../tipos/cliente.types';

export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const values: any[] = [];

    if (busqueda) {
      where += ` AND (c.nombre_cliente LIKE ? OR c.apell_cliente LIKE ? OR c.DNI_cliente LIKE ?)`;
      const searchTerm = `%${busqueda}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    const [totalResult] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total FROM CLIENTE c WHERE ${where}`,
      values
    );
    const total = totalResult[0].total;

    const query = `
      SELECT
        c.id_cliente,
        c.nombre_cliente,
        c.apell_cliente,
        c.dni_cliente AS "DNI_cliente",
        c.telefono_cliente,
        c.mail_cliente,
        c.direccion_cliente,
        c.estado_cliente,
        COALESCE(SUM(CASE WHEN cu.estado_cuota = 'Vencida' THEN cu.monto_cuota ELSE 0 END), 0) AS total_deuda,
        COALESCE(COUNT(CASE WHEN cu.estado_cuota = 'Vencida' THEN 1 END), 0) AS cuotas_vencidas,
        CASE
          WHEN COUNT(CASE WHEN cu.estado_cuota = 'Vencida' THEN 1 END) > 0 THEN true
          ELSE false
        END AS tiene_deuda
      FROM CLIENTE c
      LEFT JOIN VENTA v ON c.id_cliente = v.id_cliente
      LEFT JOIN CUOTAS cu ON v.id_venta = cu.id_venta
      WHERE ${where}
      GROUP BY c.id_cliente, c.nombre_cliente, c.apell_cliente, c.dni_cliente, c.telefono_cliente,
               c.mail_cliente, c.direccion_cliente, c.estado_cliente
      ORDER BY c.nombre_cliente, c.apell_cliente
      LIMIT ? OFFSET ?
    `;

    values.push(Number(limit), Number(offset));

    const [clients] = await pool.query<ClienteConDeuda[]>(query, values);

    res.json({
      data: clients,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [clients] = await pool.query<ClienteConDeuda>(
      `SELECT
        c.id_cliente,
        c.nombre_cliente,
        c.apell_cliente,
        c.dni_cliente AS "DNI_cliente",
        c.telefono_cliente,
        c.mail_cliente,
        c.direccion_cliente,
        c.estado_cliente,
        COALESCE(SUM(CASE WHEN cu.estado_cuota = 'Vencida' THEN cu.monto_cuota ELSE 0 END), 0) AS total_deuda,
        COALESCE(COUNT(CASE WHEN cu.estado_cuota = 'Vencida' THEN 1 END), 0) AS cuotas_vencidas,
        CASE
          WHEN COUNT(CASE WHEN cu.estado_cuota = 'Vencida' THEN 1 END) > 0 THEN true
          ELSE false
        END AS tiene_deuda
      FROM CLIENTE c
      LEFT JOIN VENTA v ON c.id_cliente = v.id_cliente
      LEFT JOIN CUOTAS cu ON v.id_venta = cu.id_venta
      WHERE c.id_cliente = ?
      GROUP BY c.id_cliente, c.nombre_cliente, c.apell_cliente, c.dni_cliente, c.telefono_cliente,
               c.mail_cliente, c.direccion_cliente, c.estado_cliente`,
      [id]
    );

    if (clients.length === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    res.json(clients[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: ClienteCrear = req.body;

    if (!data.nombre_cliente || !data.apell_cliente || !data.DNI_cliente) {
      res.status(400).json({ error: 'Nombre, apellido y DNI son requeridos' });
      return;
    }

    const [existing] = await pool.query<any[]>(
      'SELECT id_cliente FROM CLIENTE WHERE DNI_cliente = ?',
      [data.DNI_cliente]
    );

    if (existing.length > 0) {
      res.status(400).json({ error: 'Ya existe un cliente con ese DNI' });
      return;
    }

    const [inserted] = await pool.query<Cliente>(
      `INSERT INTO CLIENTE
        (nombre_cliente, apell_cliente, DNI_cliente, telefono_cliente, mail_cliente, direccion_cliente, estado_cliente)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        data.nombre_cliente,
        data.apell_cliente,
        data.DNI_cliente,
        data.telefono_cliente || null,
        data.mail_cliente || null,
        data.direccion_cliente || null,
        data.estado_cliente || 'Activo'
      ]
    );
    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data: ClienteActualizar = req.body;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre_cliente !== undefined) {
      fields.push('nombre_cliente = ?');
      values.push(data.nombre_cliente);
    }

    if (data.apell_cliente !== undefined) {
      fields.push('apell_cliente = ?');
      values.push(data.apell_cliente);
    }

    if (data.DNI_cliente !== undefined) {
      const [existing] = await pool.query<any[]>(
        'SELECT id_cliente FROM CLIENTE WHERE DNI_cliente = ? AND id_cliente != ?',
        [data.DNI_cliente, id]
      );

      if (existing.length > 0) {
        res.status(400).json({ error: 'Ya existe otro cliente con ese DNI' });
        return;
      }

      fields.push('DNI_cliente = ?');
      values.push(data.DNI_cliente);
    }

    if (data.telefono_cliente !== undefined) {
      fields.push('telefono_cliente = ?');
      values.push(data.telefono_cliente);
    }

    if (data.mail_cliente !== undefined) {
      fields.push('mail_cliente = ?');
      values.push(data.mail_cliente);
    }

    if (data.direccion_cliente !== undefined) {
      fields.push('direccion_cliente = ?');
      values.push(data.direccion_cliente);
    }

    if (data.estado_cliente !== undefined) {
      fields.push('estado_cliente = ?');
      values.push(data.estado_cliente);
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    values.push(id);

    const [, meta] = await pool.query<any[]>(
      `UPDATE CLIENTE SET ${fields.join(', ')} WHERE id_cliente = ?`,
      values
    );

    if (!meta.rowCount) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const [updated] = await pool.query<Cliente>(
      'SELECT * FROM CLIENTE WHERE id_cliente = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [pendingPayments] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total
       FROM VENTA v
       INNER JOIN CUOTAS c ON v.id_venta = c.id_venta
       WHERE v.id_cliente = ? AND c.estado_cuota IN ('Pendiente', 'Vencida')`,
      [id]
    );

    if (Number(pendingPayments[0].total) > 0) {
      res.status(400).json({
        error: 'No se puede eliminar un cliente con cuotas pendientes o vencidas',
        cuotas_pendientes: pendingPayments[0].total
      });
      return;
    }

    const [, meta] = await pool.query<any[]>(
      'UPDATE CLIENTE SET estado_cliente = ? WHERE id_cliente = ?',
      ['Bloqueado', id]
    );

    if (!meta.rowCount) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    res.json({ mensaje: 'Cliente desactivado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const toggleClientStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [client] = await pool.query<Cliente>(
      'SELECT estado_cliente FROM CLIENTE WHERE id_cliente = ?',
      [id]
    );

    if (client.length === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    const newStatus = client[0].estado_cliente === 'Activo' ? 'Bloqueado' : 'Activo';

    await pool.query(
      'UPDATE CLIENTE SET estado_cliente = ? WHERE id_cliente = ?',
      [newStatus, id]
    );

    const [updated] = await pool.query<Cliente>(
      'SELECT * FROM CLIENTE WHERE id_cliente = ?',
      [id]
    );

    res.json(updated[0]);
  } catch (error) {
    console.error('Error al alternar estado del cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
