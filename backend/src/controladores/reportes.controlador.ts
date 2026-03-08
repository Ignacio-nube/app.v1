import { Request, Response } from 'express';
import pool from '../config/baseDatos';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo_venta, id_usuario } = req.query;
    const saleTypeFilter = tipo_venta ? String(tipo_venta) : null;

    let userFilter = '';
    const userParams: any[] = [];

    if (req.usuario?.rol !== 'Administrador') {
      userFilter = ' AND id_usuario = ?';
      userParams.push(req.usuario?.id_usuario);
    } else if (id_usuario) {
      userFilter = ' AND id_usuario = ?';
      userParams.push(id_usuario);
    }

    let querySalesMonth = `
      SELECT COALESCE(SUM(total_venta), 0) as total_ventas,
             COUNT(*) as cantidad_ventas
      FROM VENTA
      WHERE DATE_PART('year', fecha_venta) = DATE_PART('year', CURRENT_DATE)
      AND DATE_PART('month', fecha_venta) = DATE_PART('month', CURRENT_DATE)
      ${userFilter}
    `;
    const paramsSalesMonth: any[] = [...userParams];

    if (saleTypeFilter) {
      querySalesMonth += ' AND tipo_venta = ?';
      paramsSalesMonth.push(saleTypeFilter);
    }

    const [salesMonth] = await pool.query<any[]>(querySalesMonth, paramsSalesMonth);

    let debtClientsCount = 0;
    if (saleTypeFilter !== 'Contado') {
      const queryDebt = `
         SELECT COUNT(DISTINCT v.id_cliente) as total_clientes_deuda
         FROM VENTA v
         INNER JOIN CUOTAS cu ON v.id_venta = cu.id_venta
         WHERE cu.estado_cuota = 'Vencida'
         ${userFilter}
      `;
      const [debtClients] = await pool.query<any>(queryDebt, userParams);
      debtClientsCount = debtClients[0].total_clientes_deuda;
    }

    const [lowStock] = await pool.query<any>(
      `SELECT COUNT(*) as productos_stock_bajo
       FROM PRODUCTOS
       WHERE stock < 10 AND estado_productos = 'Activo'`
    );

    const [totalUsers] = await pool.query<any>(
      'SELECT COUNT(*) as total_usuarios FROM USUARIO'
    );

    let queryRecentSales = `
      SELECT DATE(fecha_venta) as fecha,
              COUNT(*) as cantidad,
              SUM(total_venta) as total
       FROM VENTA
       WHERE fecha_venta >= CURRENT_DATE - INTERVAL '7 days'
       ${userFilter}
    `;
    const paramsRecentSales: any[] = [...userParams];

    if (saleTypeFilter) {
      queryRecentSales += ' AND tipo_venta = ?';
      paramsRecentSales.push(saleTypeFilter);
    }

    queryRecentSales += `
       GROUP BY DATE(fecha_venta)
       ORDER BY fecha
    `;

    const [recentSales] = await pool.query<any[]>(queryRecentSales, paramsRecentSales);

    const queryTodayInstallments = `
       SELECT cu.*, v.id_cliente, c.nombre_cliente, c.apell_cliente
       FROM CUOTAS cu
       INNER JOIN VENTA v ON cu.id_venta = v.id_venta
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       WHERE cu.estado_cuota = 'Pendiente'
       AND DATE(cu.fecha_vencimiento) = CURRENT_DATE
       ${userFilter.replace('id_usuario', 'v.id_usuario')}
       ORDER BY c.nombre_cliente
     `;

    const [todayInstallments] = await pool.query<any[]>(queryTodayInstallments, userParams);

    res.json({
      ventas_mes: salesMonth[0],
      clientes_deuda: debtClientsCount,
      productos_stock_bajo: lowStock[0].productos_stock_bajo,
      total_usuarios: totalUsers[0].total_usuarios,
      ventas_ultimos_dias: recentSales,
      cuotas_hoy: todayInstallments
    });

  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const obtenerMejoresVendedores = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [sellers] = await pool.query<any>(
      `SELECT
        u.id_usuario,
        u.nombre_usuario,
        COUNT(v.id_venta) as cantidad_ventas,
        SUM(v.total_venta) as total_vendido
       FROM USUARIO u
       INNER JOIN VENTA v ON u.id_usuario = v.id_usuario
       WHERE v.estado_vta = 'Completada'
       GROUP BY u.id_usuario, u.nombre_usuario
       ORDER BY total_vendido DESC
       LIMIT 10`
    );

    res.json(sellers);
  } catch (error) {
    console.error('Error al obtener mejores vendedores:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const reporteClientesMorosos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [clients] = await pool.query<any>(
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
         GROUP BY c.id_cliente, c.nombre_cliente, c.apell_cliente, c.DNI_cliente, c.telefono_cliente, c.estado_cliente
         ORDER BY monto_total_deuda DESC, fecha_primera_deuda`
    );

    res.json(clients);
  } catch (error) {
    console.error('Error al obtener reporte de morosos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const reporteVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_inicio, fecha_fin, tipo_venta, agrupar_por } = req.query;

    let query = `SELECT `;

    if (agrupar_por === 'dia') {
      query += `DATE(v.fecha_venta) as periodo, `;
    } else if (agrupar_por === 'mes') {
      query += `to_char(v.fecha_venta, 'YYYY-MM') as periodo, `;
    } else if (agrupar_por === 'año') {
      query += `EXTRACT(YEAR FROM v.fecha_venta) as periodo, `;
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

    const values: any[] = [];

    if (fecha_inicio) { query += ' AND DATE(v.fecha_venta) >= ?'; values.push(fecha_inicio); }
    if (fecha_fin) { query += ' AND DATE(v.fecha_venta) <= ?'; values.push(fecha_fin); }
    if (tipo_venta) { query += ' AND v.tipo_venta = ?'; values.push(tipo_venta); }

    query += ' GROUP BY periodo, v.tipo_venta ORDER BY periodo DESC';

    const [sales] = await pool.query<any[]>(query, values);

    res.json(sales);
  } catch (error) {
    console.error('Error al obtener reporte de ventas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const reporteInventario = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [inventory] = await pool.query<any>(
      `SELECT
        categoria,
        COUNT(*) as total_productos,
        SUM(stock) as total_stock,
        SUM(stock * precio_contado) as valor_inventario_contado,
        SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) as productos_stock_bajo
       FROM PRODUCTOS
       WHERE estado_productos = 'Activo'
       GROUP BY categoria
       ORDER BY categoria`
    );

    const [topSold] = await pool.query<any>(
      `SELECT
        p.id_productos,
        p.nombre_productos,
        p.categoria,
        SUM(dv.cantidad) as total_vendido,
        SUM(dv.cantidad * dv.precio_unitario) as total_ingresos
       FROM PRODUCTOS p
       INNER JOIN DETALLE_VENTA dv ON p.id_productos = dv.id_productos
       GROUP BY p.id_productos, p.nombre_productos, p.categoria
       ORDER BY total_vendido DESC
       LIMIT 20`
    );

    res.json({
      por_categoria: inventory,
      mas_vendidos: topSold
    });
  } catch (error) {
    console.error('Error al obtener reporte de inventario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const reporteFlujo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    let where = '1=1';
    const incomeValues: any[] = [];
    const expenseValues: any[] = [];

    if (fecha_inicio) {
      where += ' AND DATE(fecha_pago) >= ?';
      incomeValues.push(fecha_inicio);
      expenseValues.push(fecha_inicio);
    }

    if (fecha_fin) {
      where += ' AND DATE(fecha_pago) <= ?';
      incomeValues.push(fecha_fin);
      expenseValues.push(fecha_fin);
    }

    const [income] = await pool.query<any>(
      `SELECT
        DATE(fecha_pago) as fecha,
        tp.descripcion as tipo,
        SUM(monto) as total
       FROM PAGO p
       INNER JOIN TIPOS_PAGO tp ON p.id_tipo_pago = tp.id_tipo_pago
       WHERE ${where}
       GROUP BY DATE(fecha_pago), tp.descripcion
       ORDER BY fecha DESC`,
      incomeValues
    );

    const [expenses] = await pool.query<any>(
      `SELECT
        DATE(fecha_pago) as fecha,
        metodo_pago as tipo,
        SUM(monto) as total
       FROM PAGO_PROVEEDOR
       WHERE ${where}
       GROUP BY DATE(fecha_pago), metodo_pago
       ORDER BY fecha DESC`,
      expenseValues
    );

    const totalIncome = income.reduce((sum: number, item: any) => sum + parseFloat(item.total.toString()), 0);
    const totalExpenses = expenses.reduce((sum: number, item: any) => sum + parseFloat(item.total.toString()), 0);

    res.json({
      ingresos: income,
      egresos: expenses,
      resumen: {
        total_ingresos: totalIncome,
        total_egresos: totalExpenses,
        saldo: totalIncome - totalExpenses
      }
    });
  } catch (error) {
    console.error('Error al obtener reporte de flujo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
