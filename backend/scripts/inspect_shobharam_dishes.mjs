import './env.js';
import { connectDB } from './db.js';
async function run() {
  const pool = await connectDB(process.env.DATABASE_URL);
  const items = await pool.query(`
    SELECT id, name, price, half_price, full_price, image_url 
    FROM menu_items 
    WHERE tenant_id = '21fd932b-4374-4731-b93e-1e8acecc5881' 
      AND (
        name ILIKE '%mushroom%' 
        OR name ILIKE '%chaap%' 
        OR name ILIKE '%rajma%' 
        OR name ILIKE '%paneer%'
      )
    ORDER BY name
  `);
  console.log(JSON.stringify(items.rows, null, 2));
  process.exit(0);
}
run();
