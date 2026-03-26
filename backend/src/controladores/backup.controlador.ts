import { Request, Response } from 'express';
import pool from '../config/baseDatos';

export const generarBackup = async (_req: Request, res: Response): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();
    const fecha = timestamp.slice(0, 10);

    const [
      [clientes],
      [productos],
      [ventas],
      [cuotas],
      [pagos],
      [proveedores],
      [perfiles],
      [tiposPago],
      [usuarios],
    ] = await Promise.all([
      pool.query('SELECT * FROM CLIENTE ORDER BY id_cliente'),
      pool.query('SELECT * FROM PRODUCTOS ORDER BY id_productos'),
      pool.query('SELECT * FROM VENTA ORDER BY id_venta'),
      pool.query('SELECT * FROM CUOTAS ORDER BY id_cuota'),
      pool.query('SELECT * FROM PAGO ORDER BY id_pago'),
      pool.query('SELECT * FROM PROVEEDORES ORDER BY id_proveedor'),
      pool.query('SELECT * FROM PERFIL ORDER BY id_perfil'),
      pool.query('SELECT * FROM TIPOS_PAGO ORDER BY id_tipo_pago'),
      pool.query('SELECT id_usuario, nombre_usuario, id_perfil FROM USUARIO ORDER BY id_usuario'),
    ]);

    const backup = {
      metadata: {
        timestamp,
        version: '1.0',
        sistema: 'Cetrohogar - Sistema de Ventas',
      },
      tables: {
        clientes,
        productos,
        ventas,
        cuotas,
        pagos,
        proveedores,
        perfiles,
        tipos_pago: tiposPago,
        usuarios,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${fecha}.json"`);
    res.json(backup);
  } catch (error) {
    console.error('Error al generar backup:', error);
    res.status(500).json({ error: 'Error al generar el backup' });
  }
};
