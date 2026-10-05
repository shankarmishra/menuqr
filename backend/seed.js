import { connectDB, pool } from './db.js';
import { hashPassword } from './auth.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await connectDB(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/menusqr');
  const hash = hashPassword('password123');
  
  // Create Super Admin
  await pool.query(`INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ('admin-1', 'admin@menusqr.com', $1, 'SUPER_ADMIN', NULL) ON CONFLICT (email) DO NOTHING`, [hash]);

  // Client 1
  await pool.query(`INSERT INTO clients (id, public_id, business_name, menu_slug, category, tagline) VALUES ('client-1', 'client-pub-1', 'The Artisan', 'the-artisan', 'restaurants', 'French Fine Dining') ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name`);
  await pool.query(`INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ('user-1', 'artisan@test.com', $1, 'RESTAURANT_OWNER', 'client-1') ON CONFLICT (email) DO NOTHING`, [hash]);
  await pool.query(`INSERT INTO subscriptions (id, tenant_id, plan_id, status) VALUES ('sub-1', 'client-1', 'PREMIUM', 'active') ON CONFLICT (tenant_id) DO NOTHING`);

  // Client 2
  await pool.query(`INSERT INTO clients (id, public_id, business_name, menu_slug, category, tagline) VALUES ('client-2', 'client-pub-2', 'Royal Spice', 'royal-spice', 'restaurants', 'Indian Luxury') ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name`);
  await pool.query(`INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ('user-2', 'royal@test.com', $1, 'RESTAURANT_OWNER', 'client-2') ON CONFLICT (email) DO NOTHING`, [hash]);
  await pool.query(`INSERT INTO subscriptions (id, tenant_id, plan_id, status) VALUES ('sub-2', 'client-2', 'ESSENTIAL', 'active') ON CONFLICT (tenant_id) DO NOTHING`);

  // Client 3
  await pool.query(`INSERT INTO clients (id, public_id, business_name, menu_slug, category, tagline) VALUES ('client-3', 'client-pub-3', 'Midnight Grill', 'midnight-grill', 'restaurants', 'Steakhouse') ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name`);
  await pool.query(`INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ('user-3', 'grill@test.com', $1, 'RESTAURANT_OWNER', 'client-3') ON CONFLICT (email) DO NOTHING`, [hash]);
  await pool.query(`INSERT INTO subscriptions (id, tenant_id, plan_id, status) VALUES ('sub-3', 'client-3', 'PREMIUM', 'active') ON CONFLICT (tenant_id) DO NOTHING`);

  console.log('Test users and clients created. Default password: password123');
  process.exit(0);
}
run();
