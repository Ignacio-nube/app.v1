import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { PagoCrear, TipoPago, Cuota, CuotaConVenta } from '../tipos/pago.types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Obtener tipos de pago
export const obtenerTiposPago = async (req: Request, res: Response): Promise<void> => {
  try {
    const [tipos] = await pool.query<(TipoPago & RowDataPacket)[]>(
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
    const [ventas] = await conexion.query<RowDataPacket[]>(
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
      const [cuotas] = await conexion.query<(Cuota & RowDataPacket)[]>(
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
    const [resultadoPago] = await conexion.query<ResultSetHeader>(
      `INSERT INTO PAGO (id_venta, id_tipo_pago, fecha_pago, monto, comprobante_pago, estado)
       VALUES (?, ?, NOW(), ?, ?, ?)`,
      [datos.id_venta, datos.id_tipo_pago, datos.monto, datos.comprobante_pago || null, 'Completado']
    );

    const id_pago = resultadoPago.insertId;

    // Actualizar estado de las cuotas a Pagada
    for (const id_cuota of datos.cuotas_a_pagar) {
      await conexion.query(
        'UPDATE CUOTAS SET estado_cuota = ?, id_pago = ? WHERE id_cuota = ?',
        ['Pagada', id_pago, id_cuota]
      );
    }

    await conexion.commit();

    // Obtener el pago registrado con detalles
    const [pago] = await pool.query<RowDataPacket[]>(
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

    const [cuotas] = await pool.query<(Cuota & RowDataPacket)[]>(
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
             c.nombre_cliente, c.apell_cliente
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

    const [cuotas] = await pool.query<(CuotaConVenta & RowDataPacket)[]>(query, valores);

    res.json(cuotas);
  } catch (error) {
    console.error('Error al obtener cuotas del cliente:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Actualizar estados de cuotas vencidas (ejecutar diariamente)
export const actualizarCuotasVencidas = async (req: Request, res: Response): Promise<void> => {
  try {
    const [resultado] = await pool.query<ResultSetHeader>(
      `UPDATE CUOTAS 
       SET estado_cuota = 'Vencida' 
       WHERE estado_cuota = 'Pendiente' 
       AND fecha_vencimiento < CURDATE()`
    );

    res.json({ 
      mensaje: 'Cuotas actualizadas', 
      cuotas_vencidas: resultado.affectedRows 
    });
  } catch (error) {
    console.error('Error al actualizar cuotas vencidas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
