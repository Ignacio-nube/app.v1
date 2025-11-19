import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const configuracionDB = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'SISTEMA_VENTAS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Pool de conexiones para mejor rendimiento
const pool = mysql.createPool(configuracionDB);

// Función para verificar la conexión
export const verificarConexion = async (): Promise<boolean> => {
  try {
    const conexion = await pool.getConnection();
    console.log('✅ Conexión a MySQL exitosa');
    conexion.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error);
    return false;
  }
};

export default pool;
