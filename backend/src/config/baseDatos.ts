import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// pg no parsea correctamente usernames con punto (ej: postgres.project_ref)
// cuando se usa connection string directamente. Parseamos la URL manualmente.
const buildPoolConfig = (url: string) => {
  const parsed = new URL(url);
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  return {
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    host: parsed.hostname,
    port: parseInt(parsed.port) || 5432,
    database: parsed.pathname.replace(/^\//, ''),
    ssl: isLocal ? false : { rejectUnauthorized: false }
  };
};

const pool = connectionString
  ? new Pool(buildPoolConfig(connectionString))
  : new Pool({ connectionString });

// Convierte placeholders estilo MySQL (?) a $1, $2 ... para Postgres
const parametrizar = (texto: string, valores: any[] = []) => {
  let indice = 1;
  const sql = texto.replace(/\?/g, () => `$${indice++}`);
  return { sql, valores };
};

export const verificarConexion = async (): Promise<boolean> => {
  try {
    const cliente = await pool.connect();
    await cliente.query('SELECT 1');
    cliente.release();
    console.log('✅ Conexión a Postgres (Supabase) exitosa');
    return true;
  } catch (error: any) {
    console.error('❌ Error al conectar a Postgres:', error.message);
    return false;
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

const adaptado = {
  query: wrapQuery,
  getConnection,
  verificarConexion,
  end: () => pool.end()
};

export default adaptado;
