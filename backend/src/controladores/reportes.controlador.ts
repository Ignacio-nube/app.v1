import { Request, Response } from 'express';
import pool from '../config/baseDatos';
import { RowDataPacket } from 'mysql2';

// Dashboard - Obtener KPIs principales
export const obtenerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    // Total ventas del mes actual
    const [ventasMes] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(total_venta), 0) as total_ventas,
              COUNT(*) as cantidad_ventas
       FROM VENTA 
       WHERE YEAR(fecha_venta) = YEAR(CURDATE()) 
       AND MONTH(fecha_venta) = MONTH(CURDATE())`
    );

    // Clientes con deuda vencida
    const [clientesDeuda] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT v.id_cliente) as total_clientes_deuda
       FROM VENTA v
       INNER JOIN CUOTAS cu ON v.id_venta = cu.id_venta
       WHERE cu.estado_cuota = 'Vencida'`
    );

    // Productos con stock bajo (menos de 10)
    const [stockBajo] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as productos_stock_bajo
       FROM PRODUCTOS 
       WHERE stock < 10 AND estado_productos = 'Activo'`
    );

    // Total de usuarios activos
    const [totalUsuarios] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total_usuarios FROM USUARIO'
    );

    // Ventas últimos 7 días
    const [ventasUltimosDias] = await pool.query<RowDataPacket[]>(
      `SELECT DATE(fecha_venta) as fecha, 
              COUNT(*) as cantidad,
              SUM(total_venta) as total
       FROM VENTA 
       WHERE fecha_venta >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(fecha_venta)
       ORDER BY fecha`
    );

    // Cuotas que vencen hoy
    const [cuotasHoy] = await pool.query<RowDataPacket[]>(
      `SELECT cu.*, v.id_cliente, c.nombre_cliente, c.apell_cliente
       FROM CUOTAS cu
       INNER JOIN VENTA v ON cu.id_venta = v.id_venta
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       WHERE cu.estado_cuota = 'Pendiente' 
       AND DATE(cu.fecha_vencimiento) = CURDATE()
       ORDER BY c.nombre_cliente`
    );

    res.json({
      ventas_mes: ventasMes[0],
      clientes_deuda: clientesDeuda[0].total_clientes_deuda,
      productos_stock_bajo: stockBajo[0].productos_stock_bajo,
      total_usuarios: totalUsuarios[0].total_usuarios,
      ventas_ultimos_dias: ventasUltimosDias,
      cuotas_hoy: cuotasHoy
    });

  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Reporte de clientes morosos
export const reporteClientesMorosos = async (req: Request, res: Response): Promise<void> => {
  try {
    const [clientes] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.id_cliente,
        c.nombre_cliente,
        c.apell_cliente,
        c.DNI_cliente,
        c.telefono_cliente,
        c.estado_cliente,
        COUNT(DISTINCT cu.id_cuota) as cuotas_vencidas,
        SUM(cu.monto_cuota) as monto_total_deuda,
        MIN(cu.fecha_vencimiento) as fecha_primera_deuda
       FROM CLIENTE c
       INNER JOIN VENTA v ON c.id_cliente = v.id_cliente
       INNER JOIN CUOTAS cu ON v.id_venta = cu.id_venta
       WHERE cu.estado_cuota = 'Vencida'
       GROUP BY c.id_cliente
       ORDER BY monto_total_deuda DESC, fecha_primera_deuda`
    );

    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener reporte de morosos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Reporte de ventas con filtros
export const reporteVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_inicio, fecha_fin, tipo_venta, agrupar_por } = req.query;

    let query = `
      SELECT `;
    
    if (agrupar_por === 'dia') {
      query += `DATE(v.fecha_venta) as periodo, `;
    } else if (agrupar_por === 'mes') {
      query += `DATE_FORMAT(v.fecha_venta, '%Y-%m') as periodo, `;
    } else if (agrupar_por === 'año') {
      query += `YEAR(v.fecha_venta) as periodo, `;
    } else {
      query += `DATE(v.fecha_venta) as periodo, `;
    }

    query += `
        v.tipo_venta,
        COUNT(*) as cantidad_ventas,
        SUM(v.total_venta) as total_ventas,
        AVG(v.total_venta) as promedio_venta
      FROM VENTA v
      WHERE 1=1
    `;

    const valores: any[] = [];

    if (fecha_inicio) {
      query += ' AND DATE(v.fecha_venta) >= ?';
      valores.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND DATE(v.fecha_venta) <= ?';
      valores.push(fecha_fin);
    }

    if (tipo_venta) {
      query += ' AND v.tipo_venta = ?';
      valores.push(tipo_venta);
    }

    query += ' GROUP BY periodo, v.tipo_venta ORDER BY periodo DESC';

    const [ventas] = await pool.query<RowDataPacket[]>(query, valores);

    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener reporte de ventas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Reporte de inventario
export const reporteInventario = async (req: Request, res: Response): Promise<void> => {
  try {
    const [inventario] = await pool.query<RowDataPacket[]>(
      `SELECT 
        categoria,
        COUNT(*) as total_productos,
        SUM(stock) as total_stock,
        SUM(stock * precio_contado) as valor_inventario_contado,
        SUM(stock * precio_credito) as valor_inventario_credito,
        SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) as productos_stock_bajo
       FROM PRODUCTOS
       WHERE estado_productos = 'Activo'
       GROUP BY categoria
       ORDER BY categoria`
    );

    // Productos más vendidos
    const [masVendidos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        p.id_productos,
        p.nombre_productos,
        p.categoria,
        SUM(dv.cantidad) as total_vendido,
        SUM(dv.cantidad * dv.precio_unitario) as total_ingresos
       FROM PRODUCTOS p
       INNER JOIN DETALLE_VENTA dv ON p.id_productos = dv.id_productos
       GROUP BY p.id_productos
       ORDER BY total_vendido DESC
       LIMIT 20`
    );

    res.json({
      por_categoria: inventario,
      mas_vendidos: masVendidos
    });
  } catch (error) {
    console.error('Error al obtener reporte de inventario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Reporte de flujo de caja
export const reporteFlujo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let whereClause = '1=1';
    const valoresIngresos: any[] = [];
    const valoresEgresos: any[] = [];

    if (fecha_inicio) {
      whereClause += ' AND DATE(fecha_pago) >= ?';
      valoresIngresos.push(fecha_inicio);
      valoresEgresos.push(fecha_inicio);
    }

    if (fecha_fin) {
      whereClause += ' AND DATE(fecha_pago) <= ?';
      valoresIngresos.push(fecha_fin);
      valoresEgresos.push(fecha_fin);
    }

    // Ingresos (pagos de clientes)
    const [ingresos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE(fecha_pago) as fecha,
        tp.descripcion as tipo,
        SUM(monto) as total
       FROM PAGO p
       INNER JOIN TIPOS_PAGO tp ON p.id_tipo_pago = tp.id_tipo_pago
       WHERE ${whereClause}
       GROUP BY DATE(fecha_pago), tp.descripcion
       ORDER BY fecha DESC`,
      valoresIngresos
    );

    // Egresos (pagos a proveedores)
    const [egresos] = await pool.query<RowDataPacket[]>(
      `SELECT 
        DATE(fecha_pago) as fecha,
        metodo_pago as tipo,
        SUM(monto) as total
       FROM PAGO_PROVEEDOR
       WHERE ${whereClause}
       GROUP BY DATE(fecha_pago), metodo_pago
       ORDER BY fecha DESC`,
      valoresEgresos
    );

    // Resumen
    const totalIngresos = ingresos.reduce((sum, item) => sum + parseFloat(item.total.toString()), 0);
    const totalEgresos = egresos.reduce((sum, item) => sum + parseFloat(item.total.toString()), 0);

    res.json({
      ingresos,
      egresos,
      resumen: {
        total_ingresos: totalIngresos,
        total_egresos: totalEgresos,
        saldo: totalIngresos - totalEgresos
      }
    });
  } catch (error) {
    console.error('Error al obtener reporte de flujo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
