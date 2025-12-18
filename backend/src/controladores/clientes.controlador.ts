import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { Cliente, ClienteCrear, ClienteActualizar, ClienteConDeuda } from '../tipos/cliente.types';

// Obtener todos los clientes con información de deuda y paginación
export const obtenerClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '1=1';
    const valores: any[] = [];

    if (busqueda) {
      whereClause += ` AND (c.nombre_cliente LIKE ? OR c.apell_cliente LIKE ? OR c.DNI_cliente LIKE ?)`;
      const busquedaParam = `%${busqueda}%`;
      valores.push(busquedaParam, busquedaParam, busquedaParam);
    }

    // Obtener total
    const [totalResult] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total FROM CLIENTE c WHERE ${whereClause}`,
      valores
    );
    const total = totalResult[0].total;

    let query = `
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
      WHERE ${whereClause}
      GROUP BY c.id_cliente, c.nombre_cliente, c.apell_cliente, c.dni_cliente, c.telefono_cliente,
               c.mail_cliente, c.direccion_cliente, c.estado_cliente
      ORDER BY c.nombre_cliente, c.apell_cliente
      LIMIT ? OFFSET ?
    `;

    valores.push(Number(limit), Number(offset));

    const [clientes] = await pool.query<ClienteConDeuda[]>(query, valores);

    res.json({
      data: clientes,
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

// Obtener un cliente por ID con información de deuda
export const obtenerClientePorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [clientes] = await pool.query<ClienteConDeuda>(
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

    if (clientes.length === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    res.json(clientes[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Crear nuevo cliente
export const crearCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const datos: ClienteCrear = req.body;

    // Validar campos requeridos
    if (!datos.nombre_cliente || !datos.apell_cliente || !datos.DNI_cliente) {
      res.status(400).json({ error: 'Nombre, apellido y DNI son requeridos' });
      return;
    }

    // Verificar que el DNI no exista
    const [clientesExistentes] = await pool.query<any[]>(
      'SELECT id_cliente FROM CLIENTE WHERE DNI_cliente = ?',
      [datos.DNI_cliente]
    );

    if (clientesExistentes.length > 0) {
      res.status(400).json({ error: 'Ya existe un cliente con ese DNI' });
      return;
    }

    // Insertar cliente
    const [insertados] = await pool.query<Cliente>(
      `INSERT INTO CLIENTE 
        (nombre_cliente, apell_cliente, DNI_cliente, telefono_cliente, mail_cliente, direccion_cliente, estado_cliente)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *` ,
      [
        datos.nombre_cliente,
        datos.apell_cliente,
        datos.DNI_cliente,
        datos.telefono_cliente || null,
        datos.mail_cliente || null,
        datos.direccion_cliente || null,
        datos.estado_cliente || 'Activo'
      ]
    );
    res.status(201).json(insertados[0]);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Actualizar cliente
export const actualizarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const datos: ClienteActualizar = req.body;

    // Construir query dinámicamente
    const campos: string[] = [];
    const valores: any[] = [];

    if (datos.nombre_cliente !== undefined) {
      campos.push('nombre_cliente = ?');
      valores.push(datos.nombre_cliente);
    }

    if (datos.apell_cliente !== undefined) {
      campos.push('apell_cliente = ?');
      valores.push(datos.apell_cliente);
    }

    if (datos.DNI_cliente !== undefined) {
      // Verificar que el DNI no exista en otro cliente
      const [clientesExistentes] = await pool.query<any[]>(
        'SELECT id_cliente FROM CLIENTE WHERE DNI_cliente = ? AND id_cliente != ?',
        [datos.DNI_cliente, id]
      );

      if (clientesExistentes.length > 0) {
        res.status(400).json({ error: 'Ya existe otro cliente con ese DNI' });
        return;
      }

      campos.push('DNI_cliente = ?');
      valores.push(datos.DNI_cliente);
    }

    if (datos.telefono_cliente !== undefined) {
      campos.push('telefono_cliente = ?');
      valores.push(datos.telefono_cliente);
    }

    if (datos.mail_cliente !== undefined) {
      campos.push('mail_cliente = ?');
      valores.push(datos.mail_cliente);
    }

    if (datos.direccion_cliente !== undefined) {
      campos.push('direccion_cliente = ?');
      valores.push(datos.direccion_cliente);
    }

    if (datos.estado_cliente !== undefined) {
      campos.push('estado_cliente = ?');
      valores.push(datos.estado_cliente);
    }

    if (campos.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar' });
      return;
    }

    valores.push(id);

    const [, meta] = await pool.query<any[]>(
      `UPDATE CLIENTE SET ${campos.join(', ')} WHERE id_cliente = ?`,
      valores
    );

    if (!meta.rowCount) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    // Obtener cliente actualizado
    const [clienteActualizado] = await pool.query<Cliente>(
      'SELECT * FROM CLIENTE WHERE id_cliente = ?',
      [id]
    );

    res.json(clienteActualizado[0]);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Eliminar cliente (soft delete - cambiar estado)
export const eliminarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar si tiene ventas pendientes
    const [ventasPendientes] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total 
       FROM VENTA v
       INNER JOIN CUOTAS c ON v.id_venta = c.id_venta
       WHERE v.id_cliente = ? AND c.estado_cuota IN ('Pendiente', 'Vencida')`,
      [id]
    );

    if (Number(ventasPendientes[0].total) > 0) {
      res.status(400).json({ 
        error: 'No se puede eliminar un cliente con cuotas pendientes o vencidas',
        cuotas_pendientes: ventasPendientes[0].total
      });
      return;
    }

    // Cambiar estado en lugar de eliminar
    const [, meta] = await pool.query<any[]>(
      'UPDATE CLIENTE SET estado_cliente = ? WHERE id_cliente = ?',
      ['Inactivo', id]
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

// Alternar estado del cliente (Activo/Bloqueado)
export const alternarEstadoCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Obtener estado actual
    const [cliente] = await pool.query<Cliente>(
      'SELECT estado_cliente FROM CLIENTE WHERE id_cliente = ?',
      [id]
    );

    if (cliente.length === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    // Alternar estado
    const nuevoEstado = cliente[0].estado_cliente === 'Activo' ? 'Bloqueado' : 'Activo';

    await pool.query(
      'UPDATE CLIENTE SET estado_cliente = ? WHERE id_cliente = ?',
      [nuevoEstado, id]
    );

    // Obtener cliente actualizado
    const [clienteActualizado] = await pool.query<Cliente>(
      'SELECT * FROM CLIENTE WHERE id_cliente = ?',
      [id]
    );

    res.json(clienteActualizado[0]);
  } catch (error) {
    console.error('Error al alternar estado del cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
