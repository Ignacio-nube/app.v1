import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { VentaCrear, VentaCompleta, DetalleVentaConProducto } from '../tipos/venta.types';
import { Cliente } from '../tipos/cliente.types';
import { Producto } from '../tipos/producto.types';

export const createSale = async (req: Request, res: Response): Promise<void> => {
  const conn = await pool.getConnection();

  try {
    const data: VentaCrear = req.body;

    if (!data.id_cliente || !data.tipo_venta || !data.detalles || data.detalles.length === 0) {
      res.status(400).json({ error: 'Datos de venta incompletos' });
      return;
    }

    await conn.beginTransaction();

    const [clients] = await conn.query<Cliente>(
      'SELECT * FROM CLIENTE WHERE id_cliente = ?',
      [data.id_cliente]
    );

    if (clients.length === 0) {
      await conn.rollback();
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    if (clients[0].estado_cliente === 'Bloqueado') {
      await conn.rollback();
      res.status(400).json({ error: 'El cliente está bloqueado y no puede realizar compras' });
      return;
    }

    if (data.tipo_venta === 'Credito') {
      if (!data.configuracion_cuotas ||
          !data.configuracion_cuotas.cantidad_cuotas ||
          data.configuracion_cuotas.cantidad_cuotas <= 0 ||
          !data.configuracion_cuotas.frecuencia ||
          !data.configuracion_cuotas.fecha_primer_vencimiento) {
        await conn.rollback();
        res.status(400).json({ error: 'Configuración de cuotas requerida y válida para venta a crédito' });
        return;
      }
    }

    let subtotal = 0;
    for (const detail of data.detalles) {
      const [products] = await conn.query<Producto>(
        'SELECT * FROM PRODUCTOS WHERE id_productos = ?',
        [detail.id_productos]
      );

      if (products.length === 0) {
        await conn.rollback();
        res.status(404).json({ error: `Producto ${detail.id_productos} no encontrado` });
        return;
      }

      const product = products[0];

      if (product.stock < detail.cantidad) {
        await conn.rollback();
        res.status(400).json({
          error: `Stock insuficiente para ${product.nombre_productos}`,
          stock_disponible: product.stock,
          cantidad_solicitada: detail.cantidad
        });
        return;
      }

      subtotal += detail.precio_unitario * detail.cantidad;
    }

    const interestRate = data.tipo_venta === 'Credito' ? (data.porcentaje_interes || 0) : 0;
    const interestAmount = subtotal * (interestRate / 100);
    const totalWithInterest = subtotal + interestAmount;

    const [insertedSale] = await conn.query<{ id_venta: number }>(
      `INSERT INTO VENTA (id_cliente, id_usuario, fecha_venta, total_venta, tipo_venta, estado_vta, porcentaje_interes, total_con_interes)
       VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
       RETURNING id_venta`,
      [data.id_cliente, req.usuario?.id_usuario, subtotal, data.tipo_venta, 'Completada', interestRate, totalWithInterest]
    );

    const id_venta = insertedSale[0].id_venta;

    for (const detail of data.detalles) {
      await conn.query(
        `INSERT INTO DETALLE_VENTA (id_venta, id_productos, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [id_venta, detail.id_productos, detail.cantidad, detail.precio_unitario]
      );

      await conn.query(
        'UPDATE PRODUCTOS SET stock = stock - ? WHERE id_productos = ?',
        [detail.cantidad, detail.id_productos]
      );
    }

    if (data.tipo_venta === 'Credito' && data.configuracion_cuotas) {
      const { cantidad_cuotas, frecuencia, fecha_primer_vencimiento } = data.configuracion_cuotas;
      const installmentAmount = Number((totalWithInterest / cantidad_cuotas).toFixed(2));

      for (let i = 1; i <= cantidad_cuotas; i++) {
        const dueDate = new Date(fecha_primer_vencimiento);

        if (frecuencia === 'Semanal') {
          dueDate.setDate(dueDate.getDate() + (i - 1) * 7);
        } else if (frecuencia === 'Mensual') {
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
        }

        await conn.query(
          `INSERT INTO CUOTAS (id_venta, numero_cuota, monto_cuota, fecha_vencimiento, estado_cuota)
           VALUES (?, ?, ?, ?, ?)`,
          [id_venta, i, installmentAmount, dueDate, 'Pendiente']
        );
      }
    } else if (data.tipo_venta === 'Contado') {
      await conn.query(
        `INSERT INTO CUOTAS (id_venta, numero_cuota, monto_cuota, fecha_vencimiento, estado_cuota)
         VALUES (?, ?, ?, NOW(), ?)`,
        [id_venta, 1, subtotal, 'Pendiente']
      );
    }

    await conn.commit();

    const [sale] = await pool.query<VentaCompleta>(
      `SELECT v.*, c.nombre_cliente, c.apell_cliente
       FROM VENTA v
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       WHERE v.id_venta = ?`,
      [id_venta]
    );

    const [details] = await pool.query<DetalleVentaConProducto>(
      `SELECT dv.*, p.nombre_productos
       FROM DETALLE_VENTA dv
       INNER JOIN PRODUCTOS p ON dv.id_productos = p.id_productos
       WHERE dv.id_venta = ?`,
      [id_venta]
    );

    res.status(201).json({ ...sale[0], detalles: details });

  } catch (error) {
    await conn.rollback();
    console.error('Error al crear venta:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  } finally {
    conn.release();
  }
};

export const getSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo_venta, fecha_inicio, fecha_fin, id_cliente, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = '1=1';
    const values: any[] = [];

    if (tipo_venta) { where += ' AND v.tipo_venta = ?'; values.push(tipo_venta); }
    if (fecha_inicio) { where += ' AND DATE(v.fecha_venta) >= ?'; values.push(fecha_inicio); }
    if (fecha_fin) { where += ' AND DATE(v.fecha_venta) <= ?'; values.push(fecha_fin); }
    if (id_cliente) { where += ' AND v.id_cliente = ?'; values.push(id_cliente); }

    if (req.usuario?.rol !== 'Administrador') {
      where += ' AND v.id_usuario = ?';
      values.push(req.usuario?.id_usuario);
    } else if (req.query.id_usuario) {
      where += ' AND v.id_usuario = ?';
      values.push(req.query.id_usuario);
    }

    const [totalResult] = await pool.query<{ total: number }>(
      `SELECT COUNT(*) as total FROM VENTA v WHERE ${where}`,
      values
    );
    const total = totalResult[0].total;

    const query = `
      SELECT v.*, c.nombre_cliente, c.apell_cliente
      FROM VENTA v
      INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
      WHERE ${where}
      ORDER BY v.fecha_venta DESC
      LIMIT ? OFFSET ?
    `;
    values.push(Number(limit), Number(offset));

    const [sales] = await pool.query<any[]>(query, values);

    res.json({
      data: sales,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getSaleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [sales] = await pool.query<VentaCompleta>(
      `SELECT v.*, c.nombre_cliente, c.apell_cliente, c.DNI_cliente
       FROM VENTA v
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       WHERE v.id_venta = ?`,
      [id]
    );

    if (sales.length === 0) {
      res.status(404).json({ error: 'Venta no encontrada' });
      return;
    }

    const [details] = await pool.query<DetalleVentaConProducto>(
      `SELECT dv.*, p.nombre_productos
       FROM DETALLE_VENTA dv
       INNER JOIN PRODUCTOS p ON dv.id_productos = p.id_productos
       WHERE dv.id_venta = ?`,
      [id]
    );

    res.json({ ...sales[0], detalles: details });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
