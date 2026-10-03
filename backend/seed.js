import { connectDB, pool } from './db.js';
import { hashPassword } from './auth.js';

async function run() {
  await connectDB('postgres://postgres:postgres@localhost:5432/menuqr');
  const hash = hashPassword('password123');
  await pool.query(`INSERT INTO clients (id, public_id, business_name, menu_slug) VALUES ('client-1', 'client-1', 'Test Rest', 'test-rest') ON CONFLICT DO NOTHING`);
  await pool.query(`INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ('user-1', 'test@test.com', $1, 'RESTAURANT_OWNER', 'client-1') ON CONFLICT DO NOTHING`, [hash]);
  console.log('Test user created');
  process.exit(0);
}
run();
