import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './db.js';
async function run() {
  const pool = await connectDB(process.env.DATABASE_URL);
  await pool.query("UPDATE users SET onboarding_state = 'COMPLETED' WHERE email = $1", ['xshankarmishra11@gmail.com']);
  console.log('Updated');
  process.exit(0);
}
run();
