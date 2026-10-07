import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

export let pool = null;

export function queryPortable(executor, sql, values = []) {
  let parameterIndex = 0;
  const postgresSql = sql.replace(/\?/g, () => `$${++parameterIndex}`);
  return executor.query(postgresSql, values);
}

export async function connectDB(uri) {
  if (pool) return pool;
  
  if (!uri) {
    throw new Error('DATABASE_URL is required.');
  }

  // Handle postgres:// or postgresql:// protocols
  if (!uri.startsWith('postgres')) {
    console.warn('URI does not look like a postgres string, it might fail.');
  }

  pool = new Pool({
    connectionString: uri,
  });

  // Test connection
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW()');
    console.log('Connected to PostgreSQL:', res.rows[0].now);
    await initializeSchema(client);
  } finally {
    client.release();
  }

  return pool;
}

async function initializeSchema(client) {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('Executed schema.sql');
    }
  } catch (error) {
    console.error('Error executing schema.sql:', error);
    throw error;
  }
}
