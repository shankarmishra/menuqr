import { randomUUID } from 'crypto';
import { connectDB, pool } from './db.js';
import { config } from 'dotenv';
config();

async function migrate() {
  console.log('Starting Migration v1: Separating MenuItems, Subscriptions, and Users');
  try {
    await connectDB(process.env.DATABASE_URL);
    const clients = (await pool.query('SELECT * FROM clients')).rows;
    console.log(`Found ${clients.length} clients to migrate.`);

    for (const client of clients) {
        // Create 1-year subscription
        await pool.query(
            'INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (tenant_id) DO NOTHING',
            [randomUUID(), client.id, 'legacy_premium', 'active', new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)]
        );
        // Create QR code record
        await pool.query(
            'INSERT INTO qr_codes (id, tenant_id, public_id, qr_id, destination_type) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (tenant_id) DO NOTHING',
            [randomUUID(), client.id, client.public_id || client.id, 'qr_' + client.id, 'menu']
        );
    }
    console.log('Migration v1 complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
