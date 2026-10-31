import './env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, pool } from './db.js';
import { runBackfill } from './backfill/001_profile_backfill.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL is not set.');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...');
  await connectDB(dbUrl);

  const migrationFiles = [
    '018_phase0_review_flags.sql',
    '019_restaurant_profiles.sql',
    '020_brand_and_media.sql',
    '021_marketing_and_ordering.sql',
    '022_setup_design_slugs.sql',
  ];

  console.log('📦 Applying Blueprint v4 Migrations (018 - 022)...');
  for (const file of migrationFiles) {
    const fullPath = path.join(__dirname, 'migrations', file);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Warning: Migration file ${file} not found at ${fullPath}`);
      continue;
    }
    const sql = fs.readFileSync(fullPath, 'utf8');
    process.stdout.write(`  ⏳ Running ${file}... `);
    try {
      await pool.query(sql);
      console.log('✅ PASS');
    } catch (err) {
      console.error(`\n❌ Failed running ${file}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n🔄 Running Profile Backfill...');
  try {
    const stats = await runBackfill({ dryRun: false });
    console.log(`✅ Backfill complete:`, stats);
  } catch (err) {
    console.error('❌ Backfill failed:', err.message);
    process.exit(1);
  }

  console.log('\n🎉 ALL MIGRATIONS AND BACKFILL COMPLETED SUCCESSFULLY!');
  await pool.end();
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
