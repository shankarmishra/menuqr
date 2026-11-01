/**
 * A stateful in-memory stand-in for the owner-API tables, for cross-tenant tests without a database.
 *
 * It understands the exact statements the owner routes issue and applies Postgres semantics to
 * them, including the one that matters for tenant isolation: `INSERT ... ON CONFLICT (id) DO
 * UPDATE ... WHERE <table>.tenant_id = EXCLUDED.tenant_id` only updates a conflicting row that
 * belongs to the same tenant, while the same statement WITHOUT that guard overwrites any row.
 * A statement it does not know makes the test fail (see createFakePool).
 */

import { generateAuthToken } from '../../auth.js';
import { createTenantPool } from './fakeDb.js';

const JSON_COLUMNS = new Set(['schedule', 'i18n', 'steps', 'theme_draft', 'theme_published', 'theme', 'draft', 'published', 'theme_snapshot']);

function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let current = '';
  let quote = false;
  for (const ch of text) {
    if (ch === "'") quote = !quote;
    if (!quote) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function evaluate(token, params) {
  let m = token.match(/^\$(\d+)(?:::[\w[\]]+)?$/);
  if (m) return params[Number(m[1]) - 1];
  m = token.match(/^COALESCE\(\$(\d+)(?:::[\w[\]]+)?,\s*(.+)\)$/s);
  if (m) return params[Number(m[1]) - 1] ?? evaluate(m[2].trim(), params);
  if (/^(NOW\(\)|CURRENT_TIMESTAMP)$/i.test(token)) return new Date();
  if (/^-?\d+(\.\d+)?$/.test(token)) return Number(token);
  if (/^true$/i.test(token)) return true;
  if (/^false$/i.test(token)) return false;
  m = token.match(/^'(.*)'$/s);
  if (m) return m[1];
  return undefined;
}

/** Index of the ")" that closes the "(" at `open`, ignoring parentheses inside quotes. */
function closingParen(text, open) {
  let depth = 0;
  let quote = false;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (ch === "'") quote = !quote;
    if (quote) continue;
    if (ch === '(') depth++;
    if (ch === ')' && --depth === 0) return i;
  }
  throw new Error(`ownerFake: unbalanced parentheses: ${text.slice(0, 160)}`);
}

/** Parses `INSERT INTO t (cols) VALUES (vals) [ON CONFLICT (keys) DO ...] [RETURNING ...]` and applies it. */
function applyInsert(tables, sql, params) {
  const head = sql.match(/^INSERT INTO (\w+) \(/);
  if (!head) throw new Error(`ownerFake: cannot parse insert: ${sql.slice(0, 160)}`);
  const table = head[1];
  const colsOpen = head[0].length - 1;
  const colsClose = closingParen(sql, colsOpen);
  const valuesOpen = sql.indexOf('(', colsClose + 1);
  const valuesClose = closingParen(sql, valuesOpen);
  const columns = sql.slice(colsOpen + 1, colsClose).split(',').map((c) => c.trim());
  const tokens = splitTopLevel(sql.slice(valuesOpen + 1, valuesClose));
  const tail = sql.slice(valuesClose + 1);
  const row = {};
  columns.forEach((col, i) => {
    let value = evaluate(tokens[i], params);
    if (typeof value === 'string' && JSON_COLUMNS.has(col)) {
      try { value = JSON.parse(value); } catch { /* keep text */ }
    }
    row[col] = value;
  });

  const rows = (tables[table] ||= []);
  const conflict = tail.match(/ON CONFLICT \((.*?)\) DO (NOTHING|UPDATE SET)(.*)$/s);
  let result = row;
  if (conflict) {
    const keys = conflict[1].split(',').map((k) => k.trim());
    const existing = rows.find((r) => keys.every((k) => r[k] === row[k]));
    if (existing) {
      if (conflict[2] === 'NOTHING') return { rows: [], rowCount: 0 };
      const guarded = /\sWHERE\s+\w+\.tenant_id = EXCLUDED\.tenant_id/i.test(conflict[3]);
      if (guarded && existing.tenant_id !== row.tenant_id) return { rows: [], rowCount: 0 };
      for (const col of columns) {
        if (!keys.includes(col) && col !== 'id' && col !== 'tenant_id') existing[col] = row[col];
      }
      result = existing;
    } else {
      rows.push(row);
    }
  } else {
    rows.push(row);
  }
  return { rows: /RETURNING/i.test(tail) ? [structuredClone(result)] : [], rowCount: 1 };
}

export function createOwnerPool(tables, users = []) {
  const t = (name) => (tables[name] ||= []);
  const handlers = [
    ['FROM users WHERE id = $1', (_s, p) => users.filter((u) => u.id === p[0])],
    ['pg_advisory_xact_lock', () => []],

    // offers
    ['SELECT * FROM restaurant_offers WHERE tenant_id = $1', (_s, p) => t('restaurant_offers').filter((r) => r.tenant_id === p[0])],
    ['SELECT id FROM restaurant_offers WHERE id = $1 AND tenant_id = $2', (_s, p) => t('restaurant_offers').filter((r) => r.id === p[0] && r.tenant_id === p[1]).map((r) => ({ id: r.id }))],
    ['SELECT count(*)::int AS n FROM restaurant_offers', (_s, p) => [{ n: t('restaurant_offers').filter((r) => r.tenant_id === p[0] && r.is_active === true && r.id !== p[1]).length }]],
    ['DELETE FROM restaurant_offers WHERE id = $1 AND tenant_id = $2', (_s, p) => deleteWhere(t('restaurant_offers'), (r) => r.id === p[0] && r.tenant_id === p[1])],
    [/^INSERT INTO restaurant_offers/, (sql, p) => applyInsert(tables, sql, p)],
    ['SELECT id FROM menu_items WHERE tenant_id = $1 AND id = ANY($2::text[])', (_s, p) => t('menu_items').filter((r) => r.tenant_id === p[0] && p[1].includes(r.id)).map((r) => ({ id: r.id }))],
    ['SELECT id FROM menu_media WHERE id = $1 AND tenant_id = $2', (_s, p) => t('menu_media').filter((r) => r.id === p[0] && r.tenant_id === p[1] && !r.deleted_at).map((r) => ({ id: r.id }))],

    // announcements
    ['SELECT * FROM restaurant_announcements WHERE tenant_id = $1', (_s, p) => t('restaurant_announcements').filter((r) => r.tenant_id === p[0])],
    ['SELECT id FROM restaurant_announcements WHERE id = $1 AND tenant_id = $2', (_s, p) => t('restaurant_announcements').filter((r) => r.id === p[0] && r.tenant_id === p[1]).map((r) => ({ id: r.id }))],
    ['DELETE FROM restaurant_announcements WHERE id = $1 AND tenant_id = $2', (_s, p) => deleteWhere(t('restaurant_announcements'), (r) => r.id === p[0] && r.tenant_id === p[1])],
    [/^INSERT INTO restaurant_announcements/, (sql, p) => applyInsert(tables, sql, p)],

    // dining tables
    ['SELECT * FROM dining_tables WHERE tenant_id = $1', (_s, p) => t('dining_tables').filter((r) => r.tenant_id === p[0])],
    ['SELECT label FROM dining_tables WHERE tenant_id = $1', (_s, p) => t('dining_tables').filter((r) => r.tenant_id === p[0]).map((r) => ({ label: r.label }))],
    ['DELETE FROM dining_tables WHERE id = $1 AND tenant_id = $2', (_s, p) => deleteWhere(t('dining_tables'), (r) => r.id === p[0] && r.tenant_id === p[1])],
    [/^INSERT INTO dining_tables/, (_s, p) => {
      const [id, tenant_id, label, sort_order] = p;
      const existing = t('dining_tables').find((r) => r.tenant_id === tenant_id && r.label === label);
      if (existing) Object.assign(existing, { is_active: true, sort_order });
      else t('dining_tables').push({ id, tenant_id, label, sort_order, is_active: true });
      return { rows: [], rowCount: 1 };
    }],

    // setup progress
    ['FROM setup_progress WHERE tenant_id = $1', (_s, p) => t('setup_progress').filter((r) => r.tenant_id === p[0]).map(setupView)],
    [/^INSERT INTO setup_progress/, (_s, p) => {
      const [tenant_id, currentStep, stepsJson, completedAt] = p;
      let row = t('setup_progress').find((r) => r.tenant_id === tenant_id);
      const steps = JSON.parse(stepsJson);
      if (row) {
        row.current_step = currentStep ?? row.current_step;
        row.steps = { ...row.steps, ...steps };
        if (completedAt) row.completed_at = completedAt;
      } else {
        row = { tenant_id, current_step: currentStep ?? 'S0', steps: { s0: false, s1: false, s2: false, s3: false, s4: false, ...steps }, completed_at: completedAt || null };
        t('setup_progress').push(row);
      }
      return [setupView(row)];
    }],

    // design studio (appearance_settings theme columns and history)
    ['SELECT theme_draft as "draft", theme_published as "published", theme_version as "version" FROM appearance_settings WHERE tenant_id = $1',
      (_s, p) => t('appearance_settings').filter((r) => r.tenant_id === p[0]).map((r) => ({ draft: r.theme_draft ?? null, published: r.theme_published ?? null, version: r.theme_version ?? 0 }))],
    ['SELECT theme_published FROM appearance_settings WHERE tenant_id = $1', (_s, p) => t('appearance_settings').filter((r) => r.tenant_id === p[0]).map((r) => ({ theme_published: r.theme_published ?? null }))],
    [/^INSERT INTO appearance_settings \(id, tenant_id, theme_draft\)/, (_s, p) => {
      const [id, tenant_id, themeJson] = p;
      let row = t('appearance_settings').find((r) => r.tenant_id === tenant_id);
      if (!row) { row = { id, tenant_id }; t('appearance_settings').push(row); }
      row.theme_draft = JSON.parse(themeJson);
      return [{ draft: row.theme_draft }];
    }],
    [/^INSERT INTO design_documents/, () => ({ rows: [], rowCount: 1 })],
    ['FROM appearance_theme_history WHERE tenant_id = $1 ORDER BY version DESC', (_s, p) => t('appearance_theme_history').filter((r) => r.tenant_id === p[0]).map((r) => ({ version: r.version, theme: r.theme, createdAt: r.created_at }))],
    ['SELECT theme FROM appearance_theme_history WHERE tenant_id = $1 AND version = $2', (_s, p) => t('appearance_theme_history').filter((r) => r.tenant_id === p[0] && r.version === p[1]).map((r) => ({ theme: r.theme }))],
    [/^UPDATE appearance_settings SET template_id/, (_s, p) => {
      const [tenant_id, , themeJson] = p;
      const row = t('appearance_settings').find((r) => r.tenant_id === tenant_id);
      if (!row) return [];
      row.theme_published = JSON.parse(themeJson);
      row.theme_draft = row.theme_published;
      row.theme_version = (row.theme_version || 0) + 1;
      return [{ published: row.theme_published, version: row.theme_version }];
    }],
    [/^INSERT INTO appearance_theme_history/, (_s, p) => {
      const [id, tenant_id, version, themeJson] = p;
      if (!t('appearance_theme_history').some((r) => r.tenant_id === tenant_id && r.version === version)) {
        t('appearance_theme_history').push({ id, tenant_id, version, theme: JSON.parse(themeJson), created_at: new Date() });
      }
      return { rows: [], rowCount: 1 };
    }],
  ];
  return createTenantPool(tables, handlers);
}

function deleteWhere(rows, predicate) {
  let removed = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    if (predicate(rows[i])) { rows.splice(i, 1); removed++; }
  }
  return { rows: [], rowCount: removed };
}

function setupView(row) {
  return { currentStep: row.current_step, steps: row.steps, completedAt: row.completed_at };
}

/** A request authenticated as the owner of `tenantId` (a real signed token, like the browser's cookie). */
export function ownerHeaders(userId, tenantId) {
  const token = generateAuthToken({ id: userId, role: 'RESTAURANT_OWNER', tenantId });
  return { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
}
