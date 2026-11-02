import './env.js';
import { connectDB } from './db.js';

const DISH_PHOTOS = [
  {
    name: 'Matar Mushroom',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Masala Chaap',
    url: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Rajma Masala',
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Special Paneer Tikka Masala',
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Shahi Paneer',
    url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Kadhai Paneer',
    url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Paneer Pasanda',
    url: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=800&q=80'
  }
];

async function run() {
  const pool = await connectDB(process.env.DATABASE_URL);
  const tenantId = '21fd932b-4374-4731-b93e-1e8acecc5881';
  
  for (const item of DISH_PHOTOS) {
    const res = await pool.query(
      `UPDATE menu_items 
       SET image_url = $1, updated_at = NOW() 
       WHERE tenant_id = $2 AND name ILIKE $3 
       RETURNING id, name, image_url`,
      [item.url, tenantId, `%${item.name}%`]
    );
    console.log(`Updated ${item.name}:`, res.rows);
  }
  
  process.exit(0);
}
run().catch(console.error);
