import { connectDB, pool } from '../db.js';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: './.env' });

(async () => {
  try {
    await connectDB(process.env.DATABASE_URL);
    await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS provisioning_status VARCHAR(50) DEFAULT 'PENDING';");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_state VARCHAR(50) DEFAULT 'PENDING';");
    console.log('Migration successful');
  } catch (error) {
    console.error('Migration failed', error);
  } finally {
    process.exit(0);
  }
})();
