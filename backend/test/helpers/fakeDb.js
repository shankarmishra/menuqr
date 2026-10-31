/**
 * Test helpers that let the real route code run without a database.
 *
 * `createFakePool` is a pool whose queries are answered by an ordered list of handlers
 * ([matcher, handler]). A query with no handler THROWS, so a test fails loudly when the code
 * under test touches something the test did not expect (for example a write during a dry run).
 * Every query is recorded in `pool.calls`.
 *
 * `createTenantPool` serves the read queries of the public menu from plain row arrays and, like
 * the real database, returns only the rows whose tenant column equals the query's tenant
 * parameter. A route that forgot its tenant filter would therefore surface other tenants' rows.
 */

export function normalizeSql(sql) {
  return String(typeof sql === 'string' ? sql : sql?.text).replace(/\s+/g, ' ').trim();
}

export function createFakePool(handlers = []) {
  const calls = [];
  const query = async (sql, params = []) => {
    const text = normalizeSql(sql);
    calls.push({ sql: text, params });
    for (const [matcher, handler] of handlers) {
      const hit = matcher instanceof RegExp ? matcher.test(text) : text.includes(matcher);
      if (!hit) continue;
      const out = await handler(text, params);
      if (Array.isArray(out)) return { rows: out, rowCount: out.length };
      const rows = out?.rows ?? [];
      return { rows, rowCount: out?.rowCount ?? rows.length };
    }
    if (/^(BEGIN|COMMIT|ROLLBACK)\b/i.test(text)) return { rows: [], rowCount: 0 };
    throw new Error(`FakePool: no handler for query: ${text.slice(0, 220)}`);
  };
  return {
    query,
    calls,
    connect: async () => ({ query, release() {} }),
  };
}

export function writes(pool) {
  return pool.calls.filter((c) => /^(INSERT|UPDATE|DELETE)\b/i.test(c.sql));
}

const byTenant = (rows, key, tenantId) => rows.filter((r) => r[key] === tenantId);

/**
 * Read handlers for GET /api/public/menus/:slug, /api/public/qr/:id, order creation and the
 * order-tracking page. `tables` is { clients, subscriptions, restaurant_profiles, ordering_settings,
 * appearance_settings, menus, menu_categories, menu_items, ..., customer_orders }.
 */
export function createTenantPool(tables, extraHandlers = []) {
  const t = (name) => tables[name] || [];
  const handlers = [
    ...extraHandlers,
    ['FROM subscriptions WHERE tenant_id = $1', (_s, p) => byTenant(t('subscriptions'), 'tenant_id', p[0])],
    ['SELECT * FROM clients WHERE id = $1', (_s, p) => t('clients').filter((c) => c.id === p[0])],
    ['FROM clients WHERE menu_slug = $1 OR public_id = $1 OR id = $1', (_s, p) => t('clients').filter((c) => c.menu_slug === p[0] || c.public_id === p[0] || c.id === p[0]).map((c) => ({ id: c.id, menu_slug: c.menu_slug }))],
    ['SELECT id FROM clients WHERE menu_slug = $1', (_s, p) => t('clients').filter((c) => c.menu_slug === p[0]).map((c) => ({ id: c.id }))],
    ['FROM restaurant_profiles WHERE tenant_id = $1', (_s, p) => byTenant(t('restaurant_profiles'), 'tenant_id', p[0])],
    ['FROM restaurant_announcements', (_s, p) => byTenant(t('restaurant_announcements'), 'tenant_id', p[0])],
    ['FROM restaurant_offers', (_s, p) => byTenant(t('restaurant_offers'), 'tenant_id', p[0])],
    ['FROM ordering_settings WHERE tenant_id = $1', (_s, p) => byTenant(t('ordering_settings'), 'tenant_id', p[0])],
    ['FROM appearance_settings WHERE tenant_id = $1', (_s, p) => byTenant(t('appearance_settings'), 'tenant_id', p[0])],
    ['FROM customer_orders, jsonb_array_elements', () => []],
    ['SELECT * FROM menus WHERE tenant_id = $1', (_s, p) => byTenant(t('menus'), 'tenant_id', p[0])],
    ['FROM tenant_addon_entitlements', (_s, p) => byTenant(t('tenant_addon_entitlements'), 'tenant_id', p[0])],
    ['FROM tenant_google_reviews', (_s, p) => byTenant(t('tenant_google_reviews'), 'tenant_id', p[0])],
    ['FROM menu_categories WHERE menu_id = $1 AND tenant_id = $2', (_s, p) => t('menu_categories').filter((r) => r.menu_id === p[0] && r.tenant_id === p[1])],
    ['FROM menu_items WHERE menu_id = $1 AND tenant_id = $2', (_s, p) => t('menu_items').filter((r) => r.menu_id === p[0] && r.tenant_id === p[1])],
    ['FROM menu_item_variants WHERE tenant_id = $1', (_s, p) => byTenant(t('menu_item_variants'), 'tenant_id', p[0])],
    ['FROM menu_item_addon_groups WHERE tenant_id = $1', (_s, p) => byTenant(t('menu_item_addon_groups'), 'tenant_id', p[0])],
    ['FROM menu_item_addon_options WHERE tenant_id = $1', (_s, p) => byTenant(t('menu_item_addon_options'), 'tenant_id', p[0])],
  ];
  return createFakePool(handlers);
}
