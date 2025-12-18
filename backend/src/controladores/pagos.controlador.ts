import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { PagoCrear, TipoPago, Cuota, CuotaConVenta } from '../tipos/pago.types';

// Obtener tipos de pago
export const obtenerTiposPago = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [tipos] = await pool.query<TipoPago>(
      'SELECT * FROM TIPOS_PAGO ORDER BY descripcion'
    );

    res.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos de pago:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Registrar pago y actualizar cuotas
export const registrarPago = async (req: Request, res: Response): Promise<void> => {
  const conexion = await pool.getConnection();
  
  try {
    const datos: PagoCrear = req.body;

    // Validar datos
    if (!datos.id_venta || !datos.id_tipo_pago || !datos.monto || !datos.cuotas_a_pagar || datos.cuotas_a_pagar.length === 0) {
      res.status(400).json({ error: 'Datos de pago incompletos' });
      return;
    }

    await conexion.beginTransaction();

    // Verificar que la venta existe
    const [ventas] = await conexion.query<any[]>(
      'SELECT * FROM VENTA WHERE id_venta = ?',
      [datos.id_venta]
    );

    if (ventas.length === 0) {
      await conexion.rollback();
      res.status(404).json({ error: 'Venta no encontrada' });
      return;
    }

    // Verificar que las cuotas pertenecen a la venta y están pendientes
    let totalCuotas = 0;
    for (const id_cuota of datos.cuotas_a_pagar) {
      const [cuotas] = await conexion.query<Cuota>(
        'SELECT * FROM CUOTAS WHERE id_cuota = ? AND id_venta = ?',
        [id_cuota, datos.id_venta]
      );

      if (cuotas.length === 0) {
        await conexion.rollback();
        res.status(404).json({ error: `Cuota ${id_cuota} no encontrada o no pertenece a la venta` });
        return;
      }

      if (cuotas[0].estado_cuota === 'Pagada') {
        await conexion.rollback();
        res.status(400).json({ error: `Cuota ${id_cuota} ya está pagada` });
        return;
      }

      totalCuotas += parseFloat(cuotas[0].monto_cuota.toString());
    }

    // Validar que el monto del pago coincida con el total de cuotas
    if (Math.abs(datos.monto - totalCuotas) > 0.01) {
      await conexion.rollback();
      res.status(400).json({ 
        error: 'El monto del pago no coincide con el total de las cuotas seleccionadas',
        monto_pago: datos.monto,
        total_cuotas: totalCuotas
      });
      return;
    }

    // Registrar el pago
    const [pagoInsertado] = await conexion.query<{ id_pago: number }>(
      `INSERT INTO PAGO (id_venta, id_tipo_pago, fecha_pago, monto, comprobante_pago, estado)
       VALUES (?, ?, NOW(), ?, ?, ?)
       RETURNING id_pago`,
      [datos.id_venta, datos.id_tipo_pago, datos.monto, datos.comprobante_pago || null, 'Completado']
    );

    const id_pago = pagoInsertado[0].id_pago;

    // Actualizar estado de las cuotas a Pagada
    for (const id_cuota of datos.cuotas_a_pagar) {
      await conexion.query(
        'UPDATE CUOTAS SET estado_cuota = ?, id_pago = ? WHERE id_cuota = ?',
        ['Pagada', id_pago, id_cuota]
      );
    }

    await conexion.commit();

    // Obtener el pago registrado con detalles
    const [pago] = await pool.query<any[]>(
      `SELECT p.*, tp.descripcion as descripcion_tipo_pago
       FROM PAGO p
       INNER JOIN TIPOS_PAGO tp ON p.id_tipo_pago = tp.id_tipo_pago
       WHERE p.id_pago = ?`,
      [id_pago]
    );

    res.status(201).json(pago[0]);

  } catch (error) {
    await conexion.rollback();
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  } finally {
    conexion.release();
  }
};

// Obtener cuotas de una venta
export const obtenerCuotasPorVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_venta } = req.params;

    const [cuotas] = await pool.query<Cuota[]>(
      `SELECT * FROM CUOTAS 
       WHERE id_venta = ? 
       ORDER BY numero_cuota`,
      [id_venta]
    );

    res.json(cuotas);
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener cuotas pendientes o vencidas de un cliente
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
    const valores: any[] = [id_cliente];

    if (estado) {
      query += ' AND cu.estado_cuota = ?';
      valores.push(estado);
    }

    query += ' ORDER BY cu.fecha_vencimiento';

    const [cuotas] = await pool.query<CuotaConVenta[]>(query, valores);

    res.json(cuotas);
  } catch (error) {
    console.error('Error al obtener cuotas del cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Actualizar estados de cuotas vencidas (ejecutar diariamente)
export const actualizarCuotasVencidas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [, resultadoMeta] = await pool.query<any>(
      `UPDATE CUOTAS 
       SET estado_cuota = 'Vencida' 
       WHERE estado_cuota = 'Pendiente' 
       AND fecha_vencimiento < CURRENT_DATE`
    );

    res.json({ 
      mensaje: 'Cuotas actualizadas', 
      cuotas_vencidas: resultadoMeta.rowCount || 0 
    });
  } catch (error) {
    console.error('Error al actualizar cuotas vencidas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener todas las cuotas con paginación y filtros
export const obtenerTodasLasCuotas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estado, page = 1, limit = 10, busqueda } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '1=1';
    const valores: any[] = [];

    if (estado) {
      whereClause += ' AND cu.estado_cuota = ?';
      valores.push(estado);
    }

    if (busqueda) {
      whereClause += ' AND (c.nombre_cliente LIKE ? OR c.apell_cliente LIKE ? OR c.DNI_cliente LIKE ?)';
      const termino = `%${busqueda}%`;
      valores.push(termino, termino, termino);
    }

    // Obtener total
    const [totalResult] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total 
       FROM CUOTAS cu 
       INNER JOIN VENTA v ON cu.id_venta = v.id_venta
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       WHERE ${whereClause}`,
      valores
    );
    const total = totalResult[0].total;

    const query = `
      SELECT cu.*, v.id_cliente, v.total_venta, v.tipo_venta,
             c.nombre_cliente, c.apell_cliente, c.dni_cliente AS "DNI_cliente"
      FROM CUOTAS cu
      INNER JOIN VENTA v ON cu.id_venta = v.id_venta
      INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
      WHERE ${whereClause}
      ORDER BY cu.fecha_vencimiento
      LIMIT ? OFFSET ?
    `;
    valores.push(Number(limit), Number(offset));

    const [cuotas] = await pool.query<CuotaConVenta[]>(query, valores);

    res.json({
      data: cuotas,
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

// Obtener historial de pagos
export const obtenerHistorialPagos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, busqueda } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '1=1';
    const valores: any[] = [];

    if (busqueda) {
      whereClause += ' AND (c.nombre_cliente LIKE ? OR c.apell_cliente LIKE ? OR c.DNI_cliente LIKE ?)';
      const termino = `%${busqueda}%`;
      valores.push(termino, termino, termino);
    }

    // Obtener total
    const [totalResult] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total 
       FROM PAGO p
       INNER JOIN VENTA v ON p.id_venta = v.id_venta
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       WHERE ${whereClause}`,
      valores
    );
    const total = totalResult[0].total;

    const query = `
      SELECT p.*, tp.descripcion as descripcion_tipo_pago,
             v.id_cliente, v.total_venta, v.tipo_venta,
             c.nombre_cliente, c.apell_cliente,
             COUNT(cu.id_cuota) as cuotas_pagadas
      FROM PAGO p
      INNER JOIN TIPOS_PAGO tp ON p.id_tipo_pago = tp.id_tipo_pago
      INNER JOIN VENTA v ON p.id_venta = v.id_venta
      INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
      LEFT JOIN CUOTAS cu ON cu.id_pago = p.id_pago
      WHERE ${whereClause}
      GROUP BY p.id_pago, p.id_venta, p.id_tipo_pago, p.fecha_pago, p.monto, p.comprobante_pago, p.estado,
           tp.descripcion, v.id_cliente, v.total_venta, v.tipo_venta, c.nombre_cliente, c.apell_cliente
      ORDER BY p.fecha_pago DESC
      LIMIT ? OFFSET ?
    `;

    valores.push(Number(limit), Number(offset));

    const [pagos] = await pool.query<any[]>(query, valores);

    res.json({
      data: pagos,
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
