import { pool } from '../db.js';
import { enforceTenant } from '../auth.js';
import { apiError, sendJson, readJson } from '../utils.js';
import { randomUUID } from 'node:crypto';

export default async function appRoutes(request, response, url) {
  if (!url.pathname.startsWith('/api/app/')) return false;
  
  const user = enforceTenant(request);

  if (request.method === 'GET' && url.pathname === '/api/app/profile') {
    const res = await pool.query(`
      SELECT u.email, u.role, c.business_name as "businessName", c.menu_slug as "menuSlug", c.status, c.tagline
      FROM users u
      JOIN clients c ON u.tenant_id = c.id
      WHERE u.id = $1 AND c.id = $2
    `, [user.id, user.tenantId]);
    if (!res.rows[0]) throw apiError(404, 'Profile not found.');
    sendJson(response, 200, res.rows[0]);
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/app/dashboard') {
    const statsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM menus WHERE tenant_id = $1) as total_menus,
        (SELECT COUNT(*) FROM menu_items WHERE tenant_id = $1 AND is_available = true) as active_items,
        (SELECT COUNT(*) FROM qr_codes WHERE tenant_id = $1 AND is_active = true) as active_qrs
    `, [user.tenantId]);
    sendJson(response, 200, { stats: statsRes.rows[0] });
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/app/subscription') {
    const subRes = await pool.query(`
      SELECT plan_id as "planId", status, started_at as "startedAt", expires_at as "expiresAt"
      FROM subscriptions 
      WHERE tenant_id = $1
    `, [user.tenantId]);
    sendJson(response, 200, subRes.rows[0] || { status: 'none' });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/subscription/renew') {
    const newExpiresAt = new Date();
    newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 1);

    const subRes = await pool.query(`
      UPDATE subscriptions 
      SET status = 'ACTIVE', expires_at = $1, updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $2
      RETURNING plan_id as "planId", status, started_at as "startedAt", expires_at as "expiresAt"
    `, [newExpiresAt, user.tenantId]);

    sendJson(response, 200, subRes.rows[0]);
    return true;
  }


  if (request.method === 'GET' && url.pathname === '/api/app/qr') {
    const qrRes = await pool.query(`
      SELECT public_id as "publicId", qr_id as "qrId", destination_type as "destinationType", is_active as "isActive"
      FROM qr_codes 
      WHERE tenant_id = $1
    `, [user.tenantId]);
    sendJson(response, 200, qrRes.rows[0] || null);
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/app/qr') {
    let qrRes = await pool.query(`
      SELECT public_id as "publicId", qr_id as "qrId", destination_type as "destinationType", is_active as "isActive"
      FROM qr_codes 
      WHERE tenant_id = $1
    `, [user.tenantId]);

    if (qrRes.rows.length === 0) {
      const { randomUUID } = await import('crypto');
      const id = randomUUID();
      const qrId = randomUUID();
      
      const clientRes = await pool.query('SELECT public_id FROM clients WHERE id = $1', [user.tenantId]);
      const publicId = clientRes.rows[0].public_id;

      qrRes = await pool.query(`
        INSERT INTO qr_codes (id, tenant_id, public_id, qr_id)
        VALUES ($1, $2, $3, $4)
        RETURNING public_id as "publicId", qr_id as "qrId", destination_type as "destinationType", is_active as "isActive"
      `, [id, user.tenantId, publicId, qrId]);
    }
    
    sendJson(response, 201, qrRes.rows[0]);
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/app/appearance') {
    const res = await pool.query(`
      SELECT template_id as "templateId", logo, cover_image as "coverImage", restaurant_display_name as "restaurantDisplayName", tagline, accent_configuration as "accentConfiguration"
      FROM appearance_settings
      WHERE tenant_id = $1
    `, [user.tenantId]);
    sendJson(response, 200, res.rows[0] || {});
    return true;
  }

  if (request.method === 'PUT' && url.pathname === '/api/app/appearance') {
    const input = await readJson(request);
    const settingId = randomUUID();
    
    const res = await pool.query(`
      INSERT INTO appearance_settings (id, tenant_id, template_id, logo, cover_image, restaurant_display_name, tagline, accent_configuration)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (tenant_id) 
      DO UPDATE SET
        template_id = COALESCE(EXCLUDED.template_id, appearance_settings.template_id),
        logo = COALESCE(EXCLUDED.logo, appearance_settings.logo),
        cover_image = COALESCE(EXCLUDED.cover_image, appearance_settings.cover_image),
        restaurant_display_name = COALESCE(EXCLUDED.restaurant_display_name, appearance_settings.restaurant_display_name),
        tagline = COALESCE(EXCLUDED.tagline, appearance_settings.tagline),
        accent_configuration = COALESCE(EXCLUDED.accent_configuration, appearance_settings.accent_configuration),
        updated_at = CURRENT_TIMESTAMP
      RETURNING template_id as "templateId", logo, cover_image as "coverImage", restaurant_display_name as "restaurantDisplayName", tagline, accent_configuration as "accentConfiguration"
    `, [
      settingId,
      user.tenantId,
      input.templateId,
      input.logo,
      input.coverImage,
      input.restaurantDisplayName,
      input.tagline,
      input.accentConfiguration
    ]);
    
    sendJson(response, 200, res.rows[0]);
    return true;
  }

  if (request.method === 'PATCH' && url.pathname === '/api/app/settings') {
    const input = await readJson(request);
    const updates = {};
    if (input.businessName !== undefined) updates.business_name = input.businessName;
    if (input.menuSlug !== undefined) updates.menu_slug = input.menuSlug;
    if (input.tagline !== undefined) updates.tagline = input.tagline;
    
    if (updates.menu_slug) {
      const conflict = await pool.query('SELECT id FROM clients WHERE menu_slug = $1 AND id != $2', [updates.menu_slug, user.tenantId]);
      if (conflict.rows.length > 0) throw apiError(409, 'Menu slug already in use.');
    }

    const fields = Object.keys(updates);
    if (fields.length === 0) {
      sendJson(response, 200, { message: 'No updates provided' });
      return true;
    }

    const setClause = fields.map((f, i) => `"${f}" = $${i + 1}`).join(', ');
    const values = fields.map(f => updates[f]);
    values.push(user.tenantId);
    
    const updateRes = await pool.query(`
      UPDATE clients 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length} 
      RETURNING id, business_name as "businessName", menu_slug as "menuSlug", tagline
    `, values);
    
    sendJson(response, 200, updateRes.rows[0]);
    return true;
  }


  if (request.method === 'GET' && url.pathname === '/api/app/menu') {
    const menuRes = await pool.query('SELECT * FROM menus WHERE tenant_id = $1 LIMIT 1', [user.tenantId]);
    let menu = menuRes.rows[0];
    if (!menu) {
      const newMenuRes = await pool.query(
        'INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, $3) RETURNING *',
        [randomUUID(), user.tenantId, 'Main Menu']
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
    let { name, description, menuId } = input;
    
    if (!menuId) {
      const mRes = await pool.query('SELECT id FROM menus WHERE tenant_id = $1 LIMIT 1', [user.tenantId]);
      menuId = mRes.rows[0]?.id;
    }
    
    const catId = randomUUID();
    const maxSortRes = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM menu_categories WHERE menu_id = $1', [menuId]);
    const sortOrder = maxSortRes.rows[0].next_order;

    const res = await pool.query(
      'INSERT INTO menu_categories (id, menu_id, tenant_id, name, description, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [catId, menuId, user.tenantId, name, description || null, sortOrder]
    );
    sendJson(response, 200, res.rows[0]);
    return true;
  }

  const catMatch = url.pathname.match(/^\/api\/app\/categories\/([^/]+)$/);
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
    let { menuId, categoryId, name, description, price, halfPrice, fullPrice, dietType, isAvailable } = input;
    
    if (!menuId) {
      const mRes = await pool.query('SELECT id FROM menus WHERE tenant_id = $1 LIMIT 1', [user.tenantId]);
      menuId = mRes.rows[0]?.id;
    }
    
    const itemId = randomUUID();
    const maxSortRes = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM menu_items WHERE category_id = $1', [categoryId]);
    const sortOrder = maxSortRes.rows[0].next_order;

    const res = await pool.query(
      `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, diet_type, is_available, sort_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [itemId, menuId, user.tenantId, categoryId, name, description || null, price || null, halfPrice || null, fullPrice || null, dietType || 'veg', isAvailable !== false, sortOrder]
    );
    sendJson(response, 200, res.rows[0]);
    return true;
  }

  const itemMatch = url.pathname.match(/^\/api\/app\/items\/([^/]+)(?:\/(.+))?$/);
  if (itemMatch && request.method !== 'POST') {
    const itemId = itemMatch[1];
    const subAction = itemMatch[2];
    
    if (request.method === 'PUT' && !subAction) {
      const input = await readJson(request);
      const { categoryId, name, description, price, halfPrice, fullPrice, dietType, isAvailable } = input;
      const res = await pool.query(
        `UPDATE menu_items 
         SET category_id = $1, name = $2, description = $3, price = $4, half_price = $5, full_price = $6, diet_type = $7, is_available = $8, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $9 AND tenant_id = $10 RETURNING *`,
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

  return false;
}
