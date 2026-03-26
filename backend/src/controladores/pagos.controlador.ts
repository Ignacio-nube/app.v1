import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { PagoCrear, TipoPago, Cuota, CuotaConVenta } from '../tipos/pago.types';

export const obtenerTiposPago = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [types] = await pool.query<TipoPago>(
      'SELECT * FROM TIPOS_PAGO ORDER BY descripcion'
    );

    res.json(types);
  } catch (error) {
    console.error('Error al obtener tipos de pago:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const registerPayment = async (req: Request, res: Response): Promise<void> => {
  const conn = await pool.getConnection();

  try {
    const data: PagoCrear = req.body;

    if (!data.id_venta || !data.id_tipo_pago || !data.monto || !data.cuotas_a_pagar || data.cuotas_a_pagar.length === 0) {
      res.status(400).json({ error: 'Datos de pago incompletos' });
      return;
    }

    await conn.beginTransaction();

    const [sales] = await conn.query<any[]>(
      'SELECT * FROM VENTA WHERE id_venta = ?',
      [data.id_venta]
    );

    if (sales.length === 0) {
      await conn.rollback();
      res.status(404).json({ error: 'Venta no encontrada' });
      return;
    }

    let totalAmount = 0;
    for (const id_cuota of data.cuotas_a_pagar) {
      const [installments] = await conn.query<Cuota>(
        'SELECT * FROM CUOTAS WHERE id_cuota = ? AND id_venta = ?',
        [id_cuota, data.id_venta]
      );

      if (installments.length === 0) {
        await conn.rollback();
        res.status(404).json({ error: `Cuota ${id_cuota} no encontrada o no pertenece a la venta` });
        return;
      }

      if (installments[0].estado_cuota === 'Pagada') {
        await conn.rollback();
        res.status(400).json({ error: `Cuota ${id_cuota} ya está pagada` });
        return;
      }

      totalAmount += parseFloat(installments[0].monto_cuota.toString());
    }

    if (Math.abs(data.monto - totalAmount) > 0.01) {
      await conn.rollback();
      res.status(400).json({
        error: 'El monto del pago no coincide con el total de las cuotas seleccionadas',
        monto_pago: data.monto,
        total_cuotas: totalAmount
      });
      return;
    }

    const [insertedPayment] = await conn.query<{ id_pago: number }>(
      `INSERT INTO PAGO (id_venta, id_tipo_pago, fecha_pago, monto, comprobante_pago, estado)
       VALUES (?, ?, NOW(), ?, ?, ?)
       RETURNING id_pago`,
      [data.id_venta, data.id_tipo_pago, data.monto, data.comprobante_pago || null, 'Completado']
    );

    const id_pago = insertedPayment[0].id_pago;

    for (const id_cuota of data.cuotas_a_pagar) {
      await conn.query(
        'UPDATE CUOTAS SET estado_cuota = ?, id_pago = ? WHERE id_cuota = ?',
        ['Pagada', id_pago, id_cuota]
      );
    }

    await conn.commit();

    const [payment] = await pool.query<any[]>(
      `SELECT p.*, tp.descripcion as descripcion_tipo_pago
       FROM PAGO p
       INNER JOIN TIPOS_PAGO tp ON p.id_tipo_pago = tp.id_tipo_pago
       WHERE p.id_pago = ?`,
      [id_pago]
    );

    res.status(201).json(payment[0]);

  } catch (error) {
    await conn.rollback();
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  } finally {
    conn.release();
  }
};

export const getInstallmentsBySale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_venta } = req.params;

    const [installments] = await pool.query<Cuota[]>(
      `SELECT * FROM CUOTAS
       WHERE id_venta = ?
       ORDER BY numero_cuota`,
      [id_venta]
    );

    res.json(installments);
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const obtenerCuotasCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_cliente } = req.params;
    const { estado } = req.query;

    let query = `
      SELECT cu.*, v.id_cliente, v.total_venta, v.tipo_venta,
             c.nombre_cliente, c.apell_cliente, c.dni_cliente AS "DNI_cliente"
      FROM CUOTAS cu
      INNER JOIN VENTA v ON cu.id_venta = v.id_venta
      INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
      WHERE v.id_cliente = ?
    `;
    const values: any[] = [id_cliente];

    if (estado) {
      query += ' AND cu.estado_cuota = ?';
      values.push(estado);
    }

    query += ' ORDER BY cu.fecha_vencimiento';

    const [installments] = await pool.query<CuotaConVenta[]>(query, values);

    res.json(installments);
  } catch (error) {
    console.error('Error al obtener cuotas del cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateOverdueInstallments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [, result] = await pool.query<any>(
      `UPDATE CUOTAS
       SET estado_cuota = 'Vencida'
       WHERE estado_cuota = 'Pendiente'
       AND fecha_vencimiento < CURRENT_DATE`
    );

    res.json({
      mensaje: 'Cuotas actualizadas',
      cuotas_vencidas: result.rowCount || 0
    });
  } catch (error) {
    console.error('Error al actualizar cuotas vencidas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const obtenerTodasLasCuotas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estado, page = 1, limit = 10, busqueda } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const values: any[] = [];

    if (estado) {
      where += ' AND cu.estado_cuota = ?';
      values.push(estado);
    }

    if (busqueda) {
      where += ' AND (c.nombre_cliente LIKE ? OR c.apell_cliente LIKE ? OR c.DNI_cliente LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    const [totalResult] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total
       FROM CUOTAS cu
       INNER JOIN VENTA v ON cu.id_venta = v.id_venta
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       WHERE ${where}`,
      values
    );
    const total = totalResult[0].total;

    const query = `
      SELECT cu.*, v.id_cliente, v.total_venta, v.tipo_venta,
             c.nombre_cliente, c.apell_cliente, c.dni_cliente AS "DNI_cliente"
      FROM CUOTAS cu
      INNER JOIN VENTA v ON cu.id_venta = v.id_venta
      INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
      WHERE ${where}
      ORDER BY cu.fecha_vencimiento
      LIMIT ? OFFSET ?
    `;
    values.push(Number(limit), Number(offset));

    const [installments] = await pool.query<CuotaConVenta[]>(query, values);

    res.json({
      data: installments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener todas las cuotas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, busqueda } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const values: any[] = [];

    if (busqueda) {
      where += ' AND (c.nombre_cliente LIKE ? OR c.apell_cliente LIKE ? OR c.DNI_cliente LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    const [totalResult] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total
       FROM PAGO p
       INNER JOIN VENTA v ON p.id_venta = v.id_venta
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       WHERE ${where}`,
      values
    );
    const total = totalResult[0].total;

    const query = `
      SELECT p.*, tp.descripcion as descripcion_tipo_pago,
             v.id_cliente, v.total_venta, v.tipo_venta,
             c.nombre_cliente, c.apell_cliente, c.dni_cliente AS "DNI_cliente",
             COUNT(cu.id_cuota) as cuotas_pagadas
      FROM PAGO p
      INNER JOIN TIPOS_PAGO tp ON p.id_tipo_pago = tp.id_tipo_pago
      INNER JOIN VENTA v ON p.id_venta = v.id_venta
      INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
      LEFT JOIN CUOTAS cu ON cu.id_pago = p.id_pago
      WHERE ${where}
      GROUP BY p.id_pago, p.id_venta, p.id_tipo_pago, p.fecha_pago, p.monto, p.comprobante_pago, p.estado,
           tp.descripcion, v.id_cliente, v.total_venta, v.tipo_venta, c.nombre_cliente, c.apell_cliente, c.dni_cliente
      ORDER BY p.fecha_pago DESC
      LIMIT ? OFFSET ?
    `;

    values.push(Number(limit), Number(offset));

    const [payments] = await pool.query<any[]>(query, values);

    res.json({
      data: payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
