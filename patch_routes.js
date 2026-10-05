const fs = require('fs');

let code = fs.readFileSync('backend/routes/app.js', 'utf8');

code = code.replace(
  "import { apiError, sendJson, readJson } from '../utils.js';",
  "import { apiError, sendJson, readJson } from '../utils.js';\nimport crypto from 'crypto';"
);

const routes = `
  if (request.method === 'GET' && url.pathname === '/api/app/menu') {
    const menuRes = await pool.query('SELECT * FROM menus WHERE tenant_id = $1 LIMIT 1', [user.tenantId]);
    let menu = menuRes.rows[0];
    if (!menu) {
      const newMenuRes = await pool.query(
        'INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, $3) RETURNING *',
        [crypto.randomUUID(), user.tenantId, 'Main Menu']
      );
      menu = newMenuRes.rows[0];
    }
    
    const categoriesRes = await pool.query('SELECT * FROM menu_categories WHERE menu_id = $1 ORDER BY sort_order', [menu.id]);
    const itemsRes = await pool.query('SELECT * FROM menu_items WHERE menu_id = $1 ORDER BY sort_order', [menu.id]);
    
    const categories = categoriesRes.rows.map(cat => ({
      ...cat,
      items: itemsRes.rows.filter(item => item.category_id === cat.id)
    }));
    
    sendJson(response, 200, { menu, categories });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/categories') {
    const input = await readJson(request);
    const { name, description, menuId } = input;
    const catId = crypto.randomUUID();
    const res = await pool.query(
      'INSERT INTO menu_categories (id, menu_id, tenant_id, name, description, sort_order) VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM menu_categories WHERE menu_id = $2)) RETURNING *',
      [catId, menuId, user.tenantId, name, description || null]
    );
    sendJson(response, 200, res.rows[0]);
    return true;
  }

  const catMatch = url.pathname.match(/^\\/api\\/app\\/categories\\/([^/]+)$/);
  if (catMatch) {
    const catId = catMatch[1];
    if (request.method === 'PUT') {
      const input = await readJson(request);
      const { name, description } = input;
      const res = await pool.query(
        'UPDATE menu_categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND tenant_id = $4 RETURNING *',
        [name, description || null, catId, user.tenantId]
      );
      if (!res.rows[0]) throw apiError(404, 'Category not found');
      sendJson(response, 200, res.rows[0]);
      return true;
    }
    if (request.method === 'DELETE') {
      const res = await pool.query('DELETE FROM menu_categories WHERE id = $1 AND tenant_id = $2 RETURNING *', [catId, user.tenantId]);
      if (!res.rows[0]) throw apiError(404, 'Category not found');
      sendJson(response, 200, { success: true });
      return true;
    }
  }

  if (request.method === 'PATCH' && url.pathname === '/api/app/categories/reorder') {
    const input = await readJson(request);
    const { order } = input; 
    for (const item of order) {
      await pool.query(
        'UPDATE menu_categories SET sort_order = $1 WHERE id = $2 AND tenant_id = $3',
        [item.sort_order, item.id, user.tenantId]
      );
    }
    sendJson(response, 200, { success: true });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/items') {
    const input = await readJson(request);
    const { menuId, categoryId, name, description, price, halfPrice, fullPrice, dietType, isAvailable } = input;
    const itemId = crypto.randomUUID();
    const res = await pool.query(
      \`INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, diet_type, is_available, sort_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM menu_items WHERE category_id = $4)) RETURNING *\`,
      [itemId, menuId, user.tenantId, categoryId, name, description || null, price || null, halfPrice || null, fullPrice || null, dietType || 'veg', isAvailable !== false]
    );
    sendJson(response, 200, res.rows[0]);
    return true;
  }

  const itemMatch = url.pathname.match(/^\\/api\\/app\\/items\\/([^/]+)(?:\\/(.+))?$/);
  if (itemMatch && request.method !== 'POST') {
    const itemId = itemMatch[1];
    const subAction = itemMatch[2];
    
    if (request.method === 'PUT' && !subAction) {
      const input = await readJson(request);
      const { categoryId, name, description, price, halfPrice, fullPrice, dietType, isAvailable } = input;
      const res = await pool.query(
        \`UPDATE menu_items 
         SET category_id = $1, name = $2, description = $3, price = $4, half_price = $5, full_price = $6, diet_type = $7, is_available = $8, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $9 AND tenant_id = $10 RETURNING *\`,
        [categoryId, name, description || null, price || null, halfPrice || null, fullPrice || null, dietType || 'veg', isAvailable !== false, itemId, user.tenantId]
      );
      if (!res.rows[0]) throw apiError(404, 'Item not found');
      sendJson(response, 200, res.rows[0]);
      return true;
    }
    
    if (request.method === 'DELETE' && !subAction) {
      const res = await pool.query('DELETE FROM menu_items WHERE id = $1 AND tenant_id = $2 RETURNING *', [itemId, user.tenantId]);
      if (!res.rows[0]) throw apiError(404, 'Item not found');
      sendJson(response, 200, { success: true });
      return true;
    }
    
    if (request.method === 'PATCH' && subAction === 'availability') {
      const input = await readJson(request);
      const { isAvailable } = input;
      const res = await pool.query(
        'UPDATE menu_items SET is_available = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tenant_id = $3 RETURNING *',
        [isAvailable, itemId, user.tenantId]
      );
      if (!res.rows[0]) throw apiError(404, 'Item not found');
      sendJson(response, 200, res.rows[0]);
      return true;
    }
  }
`;

code = code.replace('  return false;\n}', routes + '\n  return false;\n}');

fs.writeFileSync('backend/routes/app.js', code);
console.log('Patched app.js');
