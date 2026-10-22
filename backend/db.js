import './env.js';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

export let pool = null;

export function setPool(p) {
  if (p && typeof p.query === 'function' && typeof p.connect !== 'function') {
    p.connect = async () => ({
      query: (sql, values) => p.query(sql, values),
      release: () => {},
    });
  }
  pool = p;
}


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

  pool.on('error', (err) => {
    console.error('[db] Unexpected error on idle PostgreSQL client:', err.message);
  });

  // Test connection
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW()');
    console.log('Connected to PostgreSQL:', res.rows[0].now);
    await initializeSchema(client);
    await runMigrations(client);
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
    if (error.code === '23505') {
      console.warn('schema.sql: duplicate key skipped (already seeded) —', error.detail);
    } else {
      console.error('Error executing schema.sql:', error.message);
      throw error;
    }
  }
}

async function runMigrations(client) {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS applied_migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const migrationsDir = path.join(__dirname, 'migrations');

    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        const migrationId = file;
        const checkRes = await client.query('SELECT id FROM applied_migrations WHERE id = $1', [migrationId]);
        if (checkRes.rows.length === 0) {
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          await client.query('BEGIN');
          try {
            await client.query(sql);
            await client.query('INSERT INTO applied_migrations (id, name) VALUES ($1, $2)', [migrationId, file]);
            await client.query('COMMIT');
            console.log(`Applied migration: ${file}`);
          } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Failed migration ${file}:`, err.message);
            throw err;
          }
        }
      }
    }
  } catch (err) {
    console.error('Migration runner error:', err.message);
  }
}
