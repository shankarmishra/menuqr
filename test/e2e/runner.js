#!/usr/bin/env node
/**
 * MenuQR E2E Test Suite Runner
 * Standalone executable runner for Tiers 1-4 opaque-box integration tests.
 * Usage:
 *   node test/e2e/runner.js
 *   node test/e2e/runner.js --tier=1
 *   node test/e2e/runner.js --tier=2
 *   node test/e2e/runner.js --tier=3
 *   node test/e2e/runner.js --tier=4
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const TIERS = {
  1: { name: 'Tier 1: Feature Coverage (Happy Paths)', file: 'test/e2e/tier1_features.test.js' },
  2: { name: 'Tier 2: Boundaries & Corners (Edge Cases & Guards)', file: 'test/e2e/tier2_boundaries.test.js' },
  3: { name: 'Tier 3: Cross-Feature Interactions (Combinations)', file: 'test/e2e/tier3_combinations.test.js' },
  4: { name: 'Tier 4: Realistic Real-World Applications (E2E Scenarios)', file: 'test/e2e/tier4_applications.test.js' },
};

function parseArgs() {
  const args = process.argv.slice(2);
  let selectedTiers = [1, 2, 3, 4];

  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      const tierNum = parseInt(arg.replace('--tier=', ''), 10);
      if (TIERS[tierNum]) {
        selectedTiers = [tierNum];
      } else {
        console.error(`Invalid tier: ${tierNum}. Available tiers: 1, 2, 3, 4.`);
        process.exit(1);
      }
    } else if (arg === '--all') {
      selectedTiers = [1, 2, 3, 4];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
MenuQR E2E Test Suite Runner
Options:
  --tier=1     Run Tier 1 Feature Coverage tests only
  --tier=2     Run Tier 2 Boundaries & Corners tests only
  --tier=3     Run Tier 3 Cross-Feature Interaction tests only
  --tier=4     Run Tier 4 Real-World Application tests only
  --all        Run all tiers (default)
      `);
      process.exit(0);
    }
  }

  return selectedTiers;
}

async function runTier(tierNumber) {
  const tier = TIERS[tierNumber];
  console.log(`\n======================================================================`);
  console.log(`🚀 Executing ${tier.name}`);
  console.log(`   File: ${tier.file}`);
  console.log(`======================================================================\n`);

  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['--test', tier.file],
      {
        cwd: rootDir,
        env: {
          ...process.env,
          NODE_ENV: 'test',
        },
        stdio: 'inherit',
      }
    );

    child.on('close', (code) => {
      resolve({ tierNumber, name: tier.name, code });
    });

    child.on('error', (err) => {
      console.error(`Failed to launch test process for ${tier.name}:`, err);
      resolve({ tierNumber, name: tier.name, code: 1, error: err });
    });
  });
}

async function main() {
  const startTime = Date.now();
  console.log(`\n======================================================================`);
  console.log(`📋 MenuQR Opaque-Box E2E Test Suite`);
  console.log(`   System 1: Subscription, Renewal & Billing Engine`);
  console.log(`   System 2: Live Digital Table Token & Realistic Thermal Bill System`);
  console.log(`======================================================================`);

  const selectedTiers = parseArgs();
  const results = [];

  for (const tierNum of selectedTiers) {
    const res = await runTier(tierNum);
    results.push(res);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalTiers = results.length;
  const passedTiers = results.filter((r) => r.code === 0).length;
  const failedTiers = results.filter((r) => r.code !== 0).length;

  console.log(`\n======================================================================`);
  console.log(`📊 E2E Test Execution Summary`);
  console.log(`======================================================================`);
  console.log(`Duration: ${durationSec}s`);
  console.log(`Tiers Run: ${totalTiers} | Passed: ${passedTiers} | Failed: ${failedTiers}\n`);

  for (const r of results) {
    const icon = r.code === 0 ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${icon} - ${r.name} (exit code: ${r.code})`);
  }
  console.log(`======================================================================\n`);

  if (failedTiers > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error running E2E test suite:', err);
  process.exit(1);
});
