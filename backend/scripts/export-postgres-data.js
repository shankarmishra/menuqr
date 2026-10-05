import fs from 'node:fs';
import path from 'node:path';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/menusqr'
});

async function exportPostgresData() {
  const backupDir = path.resolve('migration/postgres-backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const tables = [
    'users',
    'clients',
    'subscriptions',
    'menus',
    'menu_categories',
    'menu_items',
    'appearance_settings',
    'qr_codes',
    'activity_logs',
    'notifications',
    'contact_leads'
  ];

  const exportData = {};

  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT * FROM ${table}`);
      exportData[table] = res.rows;
      console.log(`Exported ${res.rows.length} rows from ${table}`);
    } catch (err) {
      console.warn(`Table ${table} export note:`, err.message);
      exportData[table] = [];
    }
  }

  const backupPath = path.join(backupDir, 'postgres-export.json');
  fs.writeFileSync(backupPath, JSON.stringify(exportData, null, 2));
  console.log(`PostgreSQL backup successfully written to ${backupPath}`);
  await pool.end();
}

exportPostgresData().catch(console.error);
