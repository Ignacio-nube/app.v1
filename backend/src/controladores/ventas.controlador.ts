import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { VentaCrear, VentaCompleta, DetalleVentaConProducto } from '../tipos/venta.types';
import { Cliente } from '../tipos/cliente.types';
import { Producto } from '../tipos/producto.types';

// Crear nueva venta con detalles y cuotas automáticas
export const crearVenta = async (req: Request, res: Response): Promise<void> => {
  const conexion = await pool.getConnection();
  
  try {
    const datos: VentaCrear = req.body;

    // Validar datos
    if (!datos.id_cliente || !datos.tipo_venta || !datos.detalles || datos.detalles.length === 0) {
      res.status(400).json({ error: 'Datos de venta incompletos' });
      return;
    }

    // Iniciar transacción
    await conexion.beginTransaction();

    // Verificar que el cliente existe y no está bloqueado
    const [clientes] = await conexion.query<Cliente[]>(
      'SELECT * FROM CLIENTE WHERE id_cliente = ?',
      [datos.id_cliente]
    );

    if (clientes.length === 0) {
      await conexion.rollback();
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    if (clientes[0].estado_cliente === 'Bloqueado') {
      await conexion.rollback();
      res.status(400).json({ error: 'El cliente está bloqueado y no puede realizar compras' });
      return;
    }

    // Si es venta a crédito, validar configuración de cuotas
    if (datos.tipo_venta === 'Credito') {
      if (!datos.configuracion_cuotas || 
          !datos.configuracion_cuotas.cantidad_cuotas || 
          datos.configuracion_cuotas.cantidad_cuotas <= 0 ||
          !datos.configuracion_cuotas.frecuencia ||
          !datos.configuracion_cuotas.fecha_primer_vencimiento) {
        await conexion.rollback();
        res.status(400).json({ error: 'Configuración de cuotas requerida y válida para venta a crédito' });
        return;
      }
    }

    // Validar stock y calcular total
    let totalVenta = 0;
    for (const detalle of datos.detalles) {
      const [productos] = await conexion.query<Producto[]>(
        'SELECT * FROM PRODUCTOS WHERE id_productos = ?',
        [detalle.id_productos]
      );

      if (productos.length === 0) {
        await conexion.rollback();
        res.status(404).json({ error: `Producto ${detalle.id_productos} no encontrado` });
        return;
      }

      const producto = productos[0];

      if (producto.stock < detalle.cantidad) {
        await conexion.rollback();
        res.status(400).json({ 
          error: `Stock insuficiente para ${producto.nombre_productos}`,
          stock_disponible: producto.stock,
          cantidad_solicitada: detalle.cantidad
        });
        return;
      }

      totalVenta += detalle.precio_unitario * detalle.cantidad;
    }

    // Crear venta
    const [ventaInsertada] = await conexion.query<{ id_venta: number }>(
      `INSERT INTO VENTA (id_cliente, id_usuario, fecha_venta, total_venta, tipo_venta, estado_vta)
       VALUES (?, ?, NOW(), ?, ?, ?)
       RETURNING id_venta`,
      [datos.id_cliente, req.usuario?.id_usuario, totalVenta, datos.tipo_venta, 'Completada']
    );

    const id_venta = ventaInsertada[0].id_venta;

    // Crear detalles de venta y reducir stock
    for (const detalle of datos.detalles) {
      // Insertar detalle
      await conexion.query(
        `INSERT INTO DETALLE_VENTA (id_venta, id_productos, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)`,
        [id_venta, detalle.id_productos, detalle.cantidad, detalle.precio_unitario]
      );

      // Reducir stock
      await conexion.query(
        'UPDATE PRODUCTOS SET stock = stock - ? WHERE id_productos = ?',
        [detalle.cantidad, detalle.id_productos]
      );
    }

    // Si es venta a crédito, generar cuotas
    if (datos.tipo_venta === 'Credito' && datos.configuracion_cuotas) {
      const { cantidad_cuotas, frecuencia, fecha_primer_vencimiento } = datos.configuracion_cuotas;
      const montoCuota = Number((totalVenta / cantidad_cuotas).toFixed(2));

      for (let i = 1; i <= cantidad_cuotas; i++) {
        // Calcular fecha de vencimiento
        const fechaVencimiento = new Date(fecha_primer_vencimiento);
        
        if (frecuencia === 'Semanal') {
          fechaVencimiento.setDate(fechaVencimiento.getDate() + (i - 1) * 7);
        } else if (frecuencia === 'Mensual') {
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (i - 1));
        }

        await conexion.query(
          `INSERT INTO CUOTAS (id_venta, numero_cuota, monto_cuota, fecha_vencimiento, estado_cuota)
           VALUES (?, ?, ?, ?, ?)`,
          [id_venta, i, montoCuota, fechaVencimiento, 'Pendiente']
        );
      }
    } else if (datos.tipo_venta === 'Contado') {
      // Generar una única cuota pendiente para ventas al contado
      await conexion.query(
        `INSERT INTO CUOTAS (id_venta, numero_cuota, monto_cuota, fecha_vencimiento, estado_cuota)
         VALUES (?, ?, ?, NOW(), ?)`,
        [id_venta, 1, totalVenta, 'Pendiente']
      );
    }

    // Confirmar transacción
    await conexion.commit();

    // Obtener venta completa con detalles
    const [ventaCompleta] = await pool.query<VentaCompleta[]>(
      `SELECT v.*, c.nombre_cliente, c.apell_cliente
       FROM VENTA v
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       WHERE v.id_venta = ?`,
      [id_venta]
    );

    const [detalles] = await pool.query<DetalleVentaConProducto[]>(
      `SELECT dv.*, p.nombre_productos
       FROM DETALLE_VENTA dv
       INNER JOIN PRODUCTOS p ON dv.id_productos = p.id_productos
       WHERE dv.id_venta = ?`,
      [id_venta]
    );

    const respuesta: VentaCompleta = {
      ...ventaCompleta[0],
      detalles: detalles
    };

    res.status(201).json(respuesta);

  } catch (error) {
    await conexion.rollback();
    console.error('Error al crear venta:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  } finally {
    conexion.release();
  }
};

// Obtener todas las ventas con filtros y paginación
export const obtenerVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo_venta, fecha_inicio, fecha_fin, id_cliente, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '1=1';
    const valores: any[] = [];

    if (tipo_venta) {
      whereClause += ' AND v.tipo_venta = ?';
      valores.push(tipo_venta);
    }

    if (fecha_inicio) {
      whereClause += ' AND DATE(v.fecha_venta) >= ?';
      valores.push(fecha_inicio);
    }

    if (fecha_fin) {
      whereClause += ' AND DATE(v.fecha_venta) <= ?';
      valores.push(fecha_fin);
    }

    if (id_cliente) {
      whereClause += ' AND v.id_cliente = ?';
      valores.push(id_cliente);
    }

    // Filtrar por usuario si no es admin o si se especifica
    if (req.usuario?.rol !== 'Administrador') {
      whereClause += ' AND v.id_usuario = ?';
      valores.push(req.usuario?.id_usuario);
    } else if (req.query.id_usuario) {
      whereClause += ' AND v.id_usuario = ?';
      valores.push(req.query.id_usuario);
    }

    // Obtener total de registros
    const [totalResult] = await pool.query<{ total: number }[]>(
      `SELECT COUNT(*) as total FROM VENTA v WHERE ${whereClause}`,
      valores
    );
    const total = totalResult[0].total;

    // Obtener registros paginados
    const query = `
      SELECT v.*, c.nombre_cliente, c.apell_cliente
      FROM VENTA v
      INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
      WHERE ${whereClause}
      ORDER BY v.fecha_venta DESC
      LIMIT ? OFFSET ?
    `;
    
    // Agregar limit y offset a los valores
    valores.push(Number(limit), Number(offset));

    const [ventas] = await pool.query<any[]>(query, valores);

    res.json({
      data: ventas,
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

// Obtener venta por ID con todos sus detalles
export const obtenerVentaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [ventas] = await pool.query<VentaCompleta[]>(
      `SELECT v.*, c.nombre_cliente, c.apell_cliente
       FROM VENTA v
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       WHERE v.id_venta = ?`,
      [id]
    );

    if (ventas.length === 0) {
      res.status(404).json({ error: 'Venta no encontrada' });
      return;
    }

    const [detalles] = await pool.query<DetalleVentaConProducto[]>(
      `SELECT dv.*, p.nombre_productos
       FROM DETALLE_VENTA dv
       INNER JOIN PRODUCTOS p ON dv.id_productos = p.id_productos
       WHERE dv.id_venta = ?`,
      [id]
    );

    const respuesta: VentaCompleta = {
      ...ventas[0],
      detalles: detalles
    };

    res.json(respuesta);
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
