import './env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, pool as sharedPool } from './db.js';
import { runBackfill } from './backfill/001_profile_backfill.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migration & Backfill Pipeline
 *
 * Safety Rules:
 * 1. Dry-run is the default. Only explicit `--apply` writes changes.
 * 2. All migrations are tracked in `schema_migrations` and `applied_migrations`.
 * 3. Fully idempotent: already applied migrations are skipped.
 * 4. Each migration runs within its own transaction. Failure is fatal.
 */
export async function runMigrationPipeline(options = {}) {
  const isApply = Boolean(options.apply);
  const isDryRun = !isApply;
  const log = options.log || console.log;
  const migrationsDir = options.migrationsDir || path.join(__dirname, 'migrations');

  const db = options.pool || sharedPool;
  if (!db) {
    throw new Error('Database pool is required.');
  }

  log(isDryRun ? '🔍 Running in DRY-RUN mode (default). No changes will be written.' : '⚡ Running in APPLY mode. Changes will be written.');

  // 1. Inspect existing migration tables
  let appliedIds = new Set();
  try {
    const tableCheck = await db.query(`
      SELECT 
        EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schema_migrations') AS has_schema_mig,
        EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'applied_migrations') AS has_applied_mig;
    `);

    if (tableCheck.rows[0]?.has_schema_mig) {
      const res = await db.query('SELECT id FROM schema_migrations');
      res.rows.forEach((r) => appliedIds.add(r.id));
    }
    if (tableCheck.rows[0]?.has_applied_mig) {
      const res = await db.query('SELECT id FROM applied_migrations');
      res.rows.forEach((r) => appliedIds.add(r.id));
    }
  } catch {
    // If tables don't exist yet, appliedIds stays empty
  }

  // 2. Discover migration files
  const files = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
    : [];

  const pending = [];
  const alreadyApplied = [];

  for (const file of files) {
    if (appliedIds.has(file)) {
      alreadyApplied.push(file);
    } else {
      pending.push(file);
    }
  }

  log(`📦 Found ${files.length} migrations (${alreadyApplied.length} applied, ${pending.length} pending).`);

  if (isDryRun) {
    for (const file of alreadyApplied) {
      log(`  ✓ [APPLIED] ${file}`);
    }
    for (const file of pending) {
      log(`  ⏳ [PENDING] ${file} (would be applied)`);
    }

    log('\n🔄 Running Profile Backfill (DRY-RUN)...');
    const backfillStats = await runBackfill({ pool: db, dryRun: true, log });
    log(`ℹ️ Backfill preview:`, backfillStats);

    log(`\n📋 DRY RUN SUMMARY: ${alreadyApplied.length} applied, ${pending.length} pending.`);
    log('🛡️ No changes were written. Run with --apply to execute.');

    return {
      dryRun: true,
      totalMigrations: files.length,
      appliedCount: alreadyApplied.length,
      pendingCount: pending.length,
      pending,
      backfillStats,
    };
  }

  // 3. Apply mode
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS applied_migrations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const file of pending) {
    log(`  ⏳ Applying ${file}... `);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await db.query('BEGIN');
    try {
      await db.query(sql);
      await db.query('INSERT INTO schema_migrations (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [file, file]);
      await db.query('INSERT INTO applied_migrations (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [file, file]);
      await db.query('COMMIT');
      log(`  ✅ Applied: ${file}`);
    } catch (err) {
      await db.query('ROLLBACK');
      log(`  ❌ Failed running ${file}: ${err.message}`);
      throw new Error(`Fatal error applying migration ${file}: ${err.message}`);
    }
  }

  log('\n🔄 Running Profile Backfill (--apply)...');
  const backfillStats = await runBackfill({ pool: db, dryRun: false, log });
  log(`✅ Backfill applied:`, backfillStats);

  log('\n🎉 ALL MIGRATIONS AND BACKFILL COMPLETED SUCCESSFULLY!');
  return {
    dryRun: false,
    appliedMigrations: pending,
    backfillStats,
  };
}

async function cli() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL is not set.');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...');
  // Do not run migrations automatically in connectDB; let runMigrationPipeline handle it
  const pool = await connectDB(dbUrl, { runMigrations: false, initializeSchema: false });

  try {
    await runMigrationPipeline({ pool, apply: isApply, log: console.log });
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fatal migration error:', err.message);
    try { await pool.end(); } catch {}
    process.exit(1);
  }
}

// Only run CLI entrypoint if executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  cli();
}
