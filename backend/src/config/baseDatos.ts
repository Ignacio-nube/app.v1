import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

console.log('Database URL presence check:', {
  exists: !!connectionString,
  length: connectionString?.length,
  prefix: connectionString?.substring(0, 10)
});

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Convierte placeholders estilo MySQL (?) a $1, $2 ... para Postgres
const parametrizar = (texto: string, valores: any[] = []) => {
  let indice = 1;
  const sql = texto.replace(/\?/g, () => `$${indice++}`);
  return { sql, valores };
};

// API compatible con el uso actual en controladores
export const verificarConexion = async (): Promise<any> => {
  try {
    const cliente = await pool.connect();
    await cliente.query('SELECT 1');
    cliente.release();
    console.log('✅ Conexión a Postgres (Supabase) exitosa');
    return { connected: true };
  } catch (error: any) {
    console.error('❌ Error al conectar a Postgres:', error);
    return { connected: false, error: error.message, code: error.code };
  }
};

type QueryResponse<T extends QueryResultRow = any> = [T[], QueryResult<T>];

const wrapQuery = async <T extends QueryResultRow>(texto: string, valores: any[] = []): Promise<QueryResponse<T>> => {
  const { sql, valores: params } = parametrizar(texto, valores);
  const result = await pool.query<T>(sql, params);
  return [result.rows, result];
};

const wrapClientQuery = async <T extends QueryResultRow>(cliente: PoolClient, texto: string, valores: any[] = []): Promise<QueryResponse<T>> => {
  const { sql, valores: params } = parametrizar(texto, valores);
  const result = await cliente.query<T>(sql, params);
  return [result.rows, result];
};

export const getConnection = async () => {
  const cliente = await pool.connect();
  return {
    query: <T extends QueryResultRow>(texto: string, valores: any[] = []) => wrapClientQuery<T>(cliente, texto, valores),
    beginTransaction: () => cliente.query('BEGIN'),
    commit: () => cliente.query('COMMIT'),
    rollback: () => cliente.query('ROLLBACK'),
    release: () => cliente.release()
  };
};

// Exponer interfaz similar a mysql2: pool.query y pool.getConnection
const adaptado = {
  query: wrapQuery,
  getConnection,
  end: () => pool.end()
};

export default adaptado;
