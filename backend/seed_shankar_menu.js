import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new pg.Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/menuqr' });

const tenantId = 'ec0b6f26-4c77-4414-9de2-b4c582a8a623';
const menuId = '0aeaa498-4407-4765-837f-d1a5e162b0ad';

const categories = [
  { name: 'Starters', description: 'Begin your meal with these amazing appetizers' },
  { name: 'Main Course', description: 'Delicious main dishes for your hunger' },
  { name: 'Beverages', description: 'Refreshing drinks and mocktails' }
];

const items = {
  'Starters': [
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 250, diet: 'veg' },
    { name: 'Hara Bhara Kebab', description: 'Healthy spinach and green peas patty', price: 220, diet: 'veg' },
    { name: 'Chicken 65', description: 'Spicy, deep-fried chicken dish', price: 300, diet: 'non-veg' },
    { name: 'Chilli Mushroom', description: 'Mushrooms tossed in spicy chilli sauce', price: 240, diet: 'veg' },
    { name: 'Fish Amritsari', description: 'Batter fried fish pakora', price: 350, diet: 'non-veg' }
  ],
  'Main Course': [
    { name: 'Butter Chicken', description: 'Chicken in a mildly spiced tomato sauce', price: 450, diet: 'non-veg' },
    { name: 'Kadai Paneer', description: 'Paneer cooked with bell peppers and spices', price: 350, diet: 'veg' },
    { name: 'Dal Makhani', description: 'Creamy and buttery black lentils', price: 280, diet: 'veg' },
    { name: 'Mutton Rogan Josh', description: 'Aromatic lamb dish of Persian origin', price: 550, diet: 'non-veg' },
    { name: 'Chicken Biryani', description: 'Classic spiced rice with chicken', price: 400, diet: 'non-veg' }
  ],
  'Beverages': [
    { name: 'Fresh Lime Soda', description: 'Refreshing lemon drink', price: 100, diet: 'veg' },
    { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', price: 150, diet: 'veg' },
    { name: 'Virgin Mojito', description: 'Mint and lemon cooler', price: 180, diet: 'veg' },
    { name: 'Mango Lassi', description: 'Sweet yogurt drink with mango', price: 120, diet: 'veg' },
    { name: 'Masala Chai', description: 'Indian spiced tea', price: 60, diet: 'veg' }
  ]
};

async function seed() {
  try {
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const catId = uuidv4();
      
      await pool.query(
        `INSERT INTO menu_categories (id, menu_id, tenant_id, name, description, sort_order) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [catId, menuId, tenantId, cat.name, cat.description, i]
      );
      
      console.log(`Added category: ${cat.name}`);

      const catItems = items[cat.name];
      for (let j = 0; j < catItems.length; j++) {
        const item = catItems[j];
        const itemId = uuidv4();
        
        await pool.query(
          `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, diet_type, sort_order) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [itemId, menuId, tenantId, catId, item.name, item.description, item.price, item.diet, j]
        );
        console.log(`  Added item: ${item.name}`);
      }
    }
    console.log("Successfully seeded 15 items across 3 categories!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    pool.end();
  }
}

seed();
