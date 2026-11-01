import test from 'node:test';
import assert from 'node:assert/strict';
import { runMigrationPipeline } from '../run_migrations.js';
import { runMigrations } from '../db.js';
import { createFakePool, writes } from './helpers/fakeDb.js';

test('runMigrationPipeline - dry-run is default and writes nothing', async () => {
  const pool = createFakePool([
    ['SELECT EXISTS (SELECT FROM information_schema.tables', () => [
      { has_schema_mig: true, has_applied_mig: true }
    ]],
    ['SELECT id FROM schema_migrations', () => [
      { id: '001_initial_schema.sql' }
    ]],
    ['SELECT id FROM applied_migrations', () => []],
    ['FROM clients ORDER BY id', () => []],
    ['SELECT tenant_id FROM restaurant_profiles', () => []],
    ['SELECT tenant_id FROM brand_kits', () => []],
    ['SELECT tenant_id FROM ordering_settings', () => []],
    ['FROM appearance_settings', () => []],
  ]);

  const logs = [];
  const result = await runMigrationPipeline({
    pool,
    apply: false,
    log: (msg) => logs.push(msg),
  });

  assert.equal(result.dryRun, true);
  assert.equal(writes(pool).length, 0, 'No INSERT/UPDATE/DELETE queries allowed in dry run');
  assert.ok(result.pendingCount > 0, 'Should detect pending migrations');
  assert.ok(result.appliedCount >= 1, 'Should detect applied migration 001');
  assert.ok(logs.some((l) => typeof l === 'string' && l.includes('DRY-RUN mode')));
});

test('runMigrationPipeline - apply mode writes migrations in schema_migrations', async () => {
  const appliedRecorded = [];
  const pool = createFakePool([
    ['SELECT EXISTS (SELECT FROM information_schema.tables', () => [
      { has_schema_mig: true, has_applied_mig: true }
    ]],
    ['SELECT id FROM schema_migrations', () => []],
    ['SELECT id FROM applied_migrations', () => []],
    ['CREATE TABLE IF NOT EXISTS schema_migrations', () => []],
    ['CREATE TABLE IF NOT EXISTS applied_migrations', () => []],
    [/^INSERT INTO schema_migrations/, (sql, params) => {
      appliedRecorded.push(params[0]);
      return { rows: [], rowCount: 1 };
    }],
    [/^INSERT INTO applied_migrations/, () => ({ rows: [], rowCount: 1 })],
    ['FROM clients ORDER BY id', () => []],
    ['SELECT tenant_id FROM restaurant_profiles', () => []],
    ['SELECT tenant_id FROM brand_kits', () => []],
    ['SELECT tenant_id FROM ordering_settings', () => []],
    ['FROM appearance_settings', () => []],
    // Catch-all for migration DDL statements
    [/.*/, () => ({ rows: [], rowCount: 0 })],
  ]);

  const logs = [];
  const result = await runMigrationPipeline({
    pool,
    apply: true,
    log: (msg) => logs.push(msg),
  });

  assert.equal(result.dryRun, false);
  assert.ok(appliedRecorded.length > 0, 'Should apply pending migrations');
  assert.ok(appliedRecorded.includes('001_initial_schema.sql'));
  assert.ok(logs.some((l) => typeof l === 'string' && l.includes('APPLY mode')));
});

test('db.js runMigrations - failed migration rolls back and is fatal (throws)', async () => {
  let rolledBack = false;
  const client = {
    query: async (sql) => {
      const s = String(sql);
      if (s.includes('CREATE TABLE IF NOT EXISTS')) return { rows: [] };
      if (s.includes('SELECT id FROM schema_migrations')) return { rows: [] }; // All pending
      if (s.includes('BEGIN')) return { rows: [] };
      if (s.includes('ROLLBACK')) {
        rolledBack = true;
        return { rows: [] };
      }
      // Simulate fatal SQL syntax error in migration
      throw new Error('syntax error at or near "CORRUPTED_SQL"');
    },
  };

  await assert.rejects(
    async () => {
      await runMigrations(client);
    },
    (err) => {
      assert.match(err.message, /Fatal migration error on/);
      assert.match(err.message, /CORRUPTED_SQL/);
      return true;
    }
  );

  assert.equal(rolledBack, true, 'Must issue ROLLBACK on failure');
});
