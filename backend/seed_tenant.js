import dotenv from 'dotenv';
dotenv.config();
import { connectDB, queryPortable } from './db.js';
import { v4 as uuidv4 } from 'uuid';

const TENANT_ID = 'ec0b6f26-4c77-4414-9de2-b4c582a8a623';

const categories = [
  { id: uuidv4(), name: 'Starters', sort_order: 1 },
  { id: uuidv4(), name: 'Main Course', sort_order: 2 },
  { id: uuidv4(), name: 'Desserts & Beverages', sort_order: 3 },
];

const items = [
  // Starters
  { name: 'Paneer Tikka', description: 'Cottage cheese marinated in spices and grilled in a tandoor.', price: 250, category: categories[0].id, type: 'veg' },
  { name: 'Chicken 65', description: 'Spicy, deep-fried chicken dish originating from Chennai.', price: 320, category: categories[0].id, type: 'non_veg' },
  { name: 'Hara Bhara Kebab', description: 'Vegetarian kebabs made with spinach, potatoes and green peas.', price: 210, category: categories[0].id, type: 'veg' },
  { name: 'Crispy Corn', description: 'Deep fried corn kernels tossed with spices.', price: 180, category: categories[0].id, type: 'veg' },
  { name: 'Mutton Seekh Kebab', description: 'Minced mutton with aromatic spices roasted on skewers.', price: 450, category: categories[0].id, type: 'non_veg' },
  
  // Main Course
  { name: 'Butter Chicken', description: 'Tender chicken cooked in a rich and creamy tomato gravy.', price: 480, category: categories[1].id, type: 'non_veg' },
  { name: 'Paneer Butter Masala', description: 'Paneer cubes in a rich tomato and cashew based gravy.', price: 380, category: categories[1].id, type: 'veg' },
  { name: 'Dal Makhani', description: 'Black lentils and red kidney beans slow-cooked with cream and butter.', price: 280, category: categories[1].id, type: 'veg' },
  { name: 'Chicken Biryani', description: 'Aromatic basmati rice cooked with marinated chicken and spices.', price: 420, category: categories[1].id, type: 'non_veg' },
  { name: 'Mutton Rogan Josh', description: 'A classic Kashmiri dish with tender mutton cooked in traditional spices.', price: 550, category: categories[1].id, type: 'non_veg' },
  
  // Desserts & Beverages
  { name: 'Gulab Jamun', description: 'Deep-fried milk dumplings soaked in cardamom flavored sugar syrup.', price: 120, category: categories[2].id, type: 'veg' },
  { name: 'Rasmalai', description: 'Soft paneer balls soaked in thickened, sweetened and flavored milk.', price: 160, category: categories[2].id, type: 'veg' },
  { name: 'Mango Lassi', description: 'Refreshing yogurt-based drink with fresh mango puree.', price: 110, category: categories[2].id, type: 'veg' },
  { name: 'Cold Coffee', description: 'Classic chilled coffee blended with milk and ice cream.', price: 150, category: categories[2].id, type: 'veg' },
  { name: 'Masala Chai', description: 'Traditional Indian tea brewed with aromatic spices.', price: 60, category: categories[2].id, type: 'veg' }
];

async function main() {
  try {
    const pool = await connectDB(process.env.DATABASE_URL);
    
    // get menu id or create
    let menuRes = await queryPortable(pool, 'SELECT id FROM menus WHERE tenant_id = ? LIMIT 1', [TENANT_ID]);
    let menuId;
    if (menuRes.rows.length > 0) {
      menuId = menuRes.rows[0].id;
    } else {
      menuId = uuidv4();
      await queryPortable(pool, 'INSERT INTO menus (id, tenant_id, name) VALUES (?, ?, ?)', [menuId, TENANT_ID, 'Main Menu']);
      console.log('Created menu with id', menuId);
    }
    
    // Insert categories
    for (const cat of categories) {
      await queryPortable(
        pool,
        'INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING',
        [cat.id, menuId, TENANT_ID, cat.name, cat.sort_order, true]
      );
    }
    console.log('Categories inserted');
    
    // Insert items
    for (const item of items) {
      await queryPortable(
        pool,
        'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, diet_type, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), menuId, TENANT_ID, item.category, item.name, item.description, item.price, item.type, true]
      );
    }
    console.log('Items inserted');

  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

main();
