#!/usr/bin/env node
/**
 * MENUQR end-to-end gate: one command that brings up a scratch database, the real backend and the
 * Vite frontend, runs the Playwright journeys, prints a pass/fail summary and tears everything down.
 *
 *   node frontend/e2e-gate/run-gate.mjs [--allow-known] [--keep-db] [--headed] [--grep <regex>] [-- <playwright args>]
 *
 * Environment (all optional):
 *   GATE_APP_ROOT      checkout whose backend + frontend are tested (default: the checkout holding this file)
 *   BASE_URL, API_URL  test servers that are ALREADY running (then nothing is started; E2E_DATABASE_URL is required)
 *   E2E_DATABASE_URL   scratch DB URL (localhost, name menuqr_e2e*). Default: derived from the local Postgres credentials
 *   E2E_PG_ADMIN_URL   localhost URL of a role that may CREATE DATABASE (default: DATABASE_URL of backend/.env)
 *   GATE_OUT_DIR       output directory (default: <main checkout>/docs/qa)
 *   GATE_API_PORT / GATE_WEB_PORT   default 3411 / 5474
 */
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, createWriteStream } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  appRoot, frontendRoot, gateRoot, outDir, ports, urls, requirePg, assertScratchDbUrl,
  scratchDbName, scratchDbUrl, adminDbUrl,
} from './lib/gate-env.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const dashDash = args.indexOf('--');
const passThrough = dashDash >= 0 ? args.slice(dashDash + 1) : [];
const grepIdx = args.indexOf('--grep');
const grep = grepIdx >= 0 ? args[grepIdx + 1] : '';

const out = outDir();
const resultsDir = join(out, 'results');
const logsDir = join(resultsDir, 'logs');
const runtimeDir = join(out, 'runtime');
const external = Boolean(process.env.BASE_URL && process.env.API_URL);
const children = [];
let dbCreated = false;
let dbName = '';

function log(message) {
  process.stdout.write(`[gate] ${message}\n`);
}

function fail(message) {
  process.stderr.write(`[gate] ERROR: ${message}\n`);
  process.exitCode = 2;
}

function killTree(child) {
  if (!child || child.exitCode !== null || !child.pid) return;
  try {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(-child.pid, 'SIGKILL');
  } catch { /* already gone */ }
}

async function portIsFree(port) {
  return new Promise((resolveFree) => {
    const probe = createServer();
    probe.once('error', () => resolveFree(false));
    probe.listen(port, '127.0.0.1', () => probe.close(() => resolveFree(true)));
  });
}

async function waitForUrl(url, timeoutMs, label) {
  const started = Date.now();
  let lastError = '';
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (response.status < 500) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${label} did not become ready at ${url} within ${Math.round(timeoutMs / 1000)}s (${lastError}). See ${logsDir}`);
}

function startService(name, command, commandArgs, options) {
  const logFile = join(logsDir, `${name}.log`);
  const stream = createWriteStream(logFile, { flags: 'w' });
  const child = spawn(command, commandArgs, {
    cwd: options.cwd,
    env: options.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
    windowsHide: true,
  });
  child.stdout.pipe(stream, { end: false });
  child.stderr.pipe(stream, { end: false });
  child.on('close', (code) => stream.end(`\n[gate] ${name} exited with code ${code}\n`));
  children.push(child);
  return child;
}

async function prepareDatabase() {
  if (process.env.E2E_DATABASE_URL) {
    const info = assertScratchDbUrl(process.env.E2E_DATABASE_URL);
    log(`using scratch database ${info.label} (supplied by E2E_DATABASE_URL; not created or dropped)`);
    return process.env.E2E_DATABASE_URL;
  }
  if (external) throw new Error('BASE_URL/API_URL were given, so E2E_DATABASE_URL (the scratch DB those servers use) is required.');
  dbName = scratchDbName();
  const url = scratchDbUrl();
  const info = assertScratchDbUrl(url);
  const { Client } = requirePg();
  const admin = new Client({ connectionString: adminDbUrl() });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${info.name}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${info.name}"`);
    dbCreated = true;
  } finally {
    await admin.end();
  }
  log(`created scratch database ${info.label}`);
  return url;
}

async function dropDatabase() {
  if (!dbCreated || flag('--keep-db')) {
    if (dbCreated) log(`keeping scratch database ${dbName} (--keep-db)`);
    return;
  }
  try {
    const info = assertScratchDbUrl(scratchDbUrl());
    const { Client } = requirePg();
    const admin = new Client({ connectionString: adminDbUrl() });
    await admin.connect();
    try {
      await admin.query(`DROP DATABASE IF EXISTS "${info.name}" WITH (FORCE)`);
    } finally {
      await admin.end();
    }
    log(`dropped scratch database ${info.name}`);
  } catch (error) {
    log(`could not drop the scratch database: ${error instanceof Error ? error.message : error}`);
  }
}

const BLANKED_ENV = [
  'ADMIN_PASSWORD', 'ADMIN_EMAIL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM_NAME',
  'MAIL_FROM_ADDRESS', 'BREVO_API_KEY', 'BREVO_SENDER_EMAIL', 'EMAIL_PROVIDER', 'RESEND_API_KEY', 'RESEND_WEBHOOK_SECRET',
  'CASHFREE_APP_ID', 'CASHFREE_SECRET_KEY', 'GEMINI_API_KEY', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
  'S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'ASSET_BASE_URL', 'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'COOKIE_DOMAIN', 'COOKIE_SECURE', 'ADMIN_FRONTEND_ORIGIN',
];

function backendEnv(databaseUrl, secrets) {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (/^(DATABASE_URL|JWT_|OTP_|ADMIN_|SMTP|BREVO|RESEND|CASHFREE|GEMINI|UPSTASH|SUPABASE|S3_|STORAGE_|EMAIL|ENABLE_EMAIL|MAIL_|FRONTEND_|COOKIE_|NODE_ENV|PORT|API_PORT)/.test(key)) continue;
    env[key] = value;
  }
  for (const key of BLANKED_ENV) env[key] = '';
  const origins = [`http://127.0.0.1:${ports.web}`, `http://localhost:${ports.web}`].join(',');
  return {
    ...env,
    NODE_ENV: 'development', // NOT "test": server.js does not listen when NODE_ENV=test
    PORT: String(ports.api),
    API_PORT: String(ports.api),
    DATABASE_URL: databaseUrl,
    JWT_SECRET: secrets.jwt,
    OTP_SECRET: secrets.otp,
    ADMIN_OTP_PEPPER: secrets.pepper,
    FRONTEND_ORIGINS: origins,
    ENABLE_EMAIL_SERVICE: 'false',
    STORAGE_DRIVER: 'local',
  };
}

function summarise(code) {
  const jsonFile = join(resultsDir, 'playwright.json');
  const checksFile = join(resultsDir, 'checks.jsonl');
  const knownFile = join(gateRoot, 'known-defects.json');
  const known = existsSync(knownFile) ? JSON.parse(readFileSync(knownFile, 'utf8')) : {};
  const stats = { passed: 0, failed: 0, skipped: 0, flaky: 0 };
  const failedTests = [];
  if (existsSync(jsonFile)) {
    const report = JSON.parse(readFileSync(jsonFile, 'utf8'));
    const walk = (suite, file) => {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          const status = test.status; // expected | unexpected | flaky | skipped
          if (status === 'expected') stats.passed++;
          else if (status === 'skipped') stats.skipped++;
          else if (status === 'flaky') stats.flaky++;
          else {
            stats.failed++;
            const message = (test.results?.at(-1)?.error?.message || '').replace(/\u001b\[[0-9;]*m/g, '').split('\n').slice(0, 3).join(' | ');
            failedTests.push({ title: spec.title, file: spec.file || file, message: message.slice(0, 280) });
          }
        }
      }
      for (const child of suite.suites || []) walk(child, suite.file || file);
    };
    for (const suite of report.suites || []) walk(suite, suite.file);
  }
  const checks = { pass: 0, fail: 0, skip: 0, failKnown: 0, failNew: 0, fixedKnown: [], failures: [] };
  if (existsSync(checksFile)) {
    const latest = new Map();
    for (const line of readFileSync(checksFile, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        latest.set(entry.id, entry); // a retried check keeps its last result
      } catch { /* ignore a torn line */ }
    }
    for (const entry of latest.values()) {
      if (entry.status === 'pass') {
        checks.pass++;
        if (known[entry.id]) checks.fixedKnown.push(entry.id);
      } else if (entry.status === 'skip') checks.skip++;
      else {
        checks.fail++;
        if (known[entry.id]) checks.failKnown++;
        else checks.failNew++;
        checks.failures.push({ id: entry.id, desc: entry.desc, known: known[entry.id]?.defect || null, severity: known[entry.id]?.severity || null, error: String(entry.error || '').slice(0, 220) });
      }
    }
  }
  const lines = [];
  lines.push('==================== MENUQR E2E GATE SUMMARY ====================');
  lines.push(`Tests   : ${stats.passed} passed, ${stats.failed} failed, ${stats.skipped} skipped, ${stats.flaky} flaky`);
  lines.push(`Checks  : ${checks.pass} passed, ${checks.fail} failed (${checks.failKnown} known baseline defects, ${checks.failNew} NEW), ${checks.skip} skipped`);
  if (checks.fixedKnown.length) lines.push(`Fixed   : ${checks.fixedKnown.length} known-defect check(s) now pass: ${checks.fixedKnown.join(', ')}`);
  for (const failure of checks.failures) {
    lines.push(`  FAIL ${failure.known ? `[${failure.known} ${failure.severity || ''}]` : '[NEW]'} ${failure.id}: ${failure.desc}`);
    if (failure.error) lines.push(`       ${failure.error.replace(/\s+/g, ' ')}`);
  }
  for (const failed of failedTests) lines.push(`  TEST FAILED: ${failed.title} (${failed.file}) ${failed.message ? `- ${failed.message}` : ''}`);
  const testsOnlyFailures = failedTests.length > 0 && checks.fail === 0;
  const blocking = flag('--allow-known') ? checks.failNew + (testsOnlyFailures ? failedTests.length : 0) : checks.fail + failedTests.length;
  const verdict = code !== 0 && stats.passed + stats.failed === 0 ? 'ERROR (nothing ran)' : blocking === 0 ? 'PASS' : 'FAIL';
  lines.push(`VERDICT : ${verdict}${flag('--allow-known') ? ' (known baseline defects tolerated)' : ''}`);
  lines.push(`Results : ${resultsDir}`);
  lines.push('=================================================================');
  const text = lines.join('\n');
  writeFileSync(join(resultsDir, 'summary.txt'), `${text}\n`);
  writeFileSync(join(resultsDir, 'summary.json'), JSON.stringify({ stats, checks, failedTests, verdict, finishedAt: new Date().toISOString() }, null, 2));
  process.stdout.write(`\n${text}\n`);
  return verdict === 'PASS' ? 0 : 1;
}

async function main() {
  mkdirSync(logsDir, { recursive: true });
  mkdirSync(runtimeDir, { recursive: true });
  rmSync(join(resultsDir, 'checks.jsonl'), { force: true });
  rmSync(join(resultsDir, 'playwright.json'), { force: true });
  const root = appRoot();
  if (!existsSync(join(root, 'backend', 'server.js'))) throw new Error(`No backend/server.js under GATE_APP_ROOT ${root}`);
  const serverPath = join(root, 'backend', 'server.js');
  if (!external && (process.execPath + serverPath).includes('test')) {
    throw new Error('The path of node or backend/server.js contains "test"; backend/server.js then believes it runs under a test runner and never listens. Check out the repo under a path without "test".');
  }

  const databaseUrl = await prepareDatabase();
  const secrets = { jwt: randomBytes(24).toString('hex'), otp: randomBytes(24).toString('hex'), pepper: randomBytes(24).toString('hex') };
  const { base, api } = urls();

  if (!external) {
    for (const port of [ports.api, ports.web]) {
      if (!(await portIsFree(port))) throw new Error(`Port ${port} is already in use. Set GATE_API_PORT/GATE_WEB_PORT or stop the other process.`);
    }
    const backendCwd = join(runtimeDir, 'backend-cwd'); // uploads land here, not in the repo
    mkdirSync(backendCwd, { recursive: true });
    log(`starting backend from ${root} on :${ports.api}`);
    startService('backend', process.execPath, [serverPath], { cwd: backendCwd, env: backendEnv(databaseUrl, secrets) });
    await waitForUrl(`${api}/api/health`, 90_000, 'Backend');

    const viteDir = dirname(createRequire(join(root, 'frontend', 'package.json')).resolve('vite/package.json'));
    log(`starting Vite from ${root}/frontend on :${ports.web} (proxy -> ${api})`);
    startService('frontend', process.execPath, [join(viteDir, 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', String(ports.web), '--strictPort'], {
      cwd: join(root, 'frontend'),
      env: { ...process.env, MENUSQR_API_PROXY: api, VITE_ADMIN_HOSTNAME: 'localhost', VITE_API_BASE_URL: '', BROWSER: 'none' },
    });
    await waitForUrl(`${base}/`, 120_000, 'Frontend');
  } else {
    log(`external mode: testing ${base} (API ${api}); nothing is started`);
    await waitForUrl(`${api}/api/health`, 20_000, 'Backend');
    await waitForUrl(`${base}/`, 20_000, 'Frontend');
  }

  const playwrightCli = createRequire(join(frontendRoot, 'package.json')).resolve('@playwright/test/cli');
  const pwArgs = ['test', '--config', 'playwright.gate.config.ts'];
  if (grep) pwArgs.push('--grep', grep);
  if (flag('--headed')) pwArgs.push('--headed');
  pwArgs.push(...passThrough);
  log(`running Playwright (${pwArgs.join(' ')})`);
  const playwrightEnv = {
    ...process.env,
    BASE_URL: base,
    API_URL: api,
    E2E_DATABASE_URL: databaseUrl,
    GATE_OUT_DIR: out,
    GATE_APP_ROOT: root,
    PLAYWRIGHT_JSON_OUTPUT_NAME: join(resultsDir, 'playwright.json'),
  };
  delete playwrightEnv.FORCE_COLOR;
  const run = spawnSync(process.execPath, [playwrightCli, ...pwArgs], { cwd: frontendRoot, env: playwrightEnv, stdio: 'inherit' });
  return summarise(run.status ?? 1);
}

let exitCode = 1;
const cleanup = async () => {
  for (const child of children) killTree(child);
  await dropDatabase();
};
process.on('SIGINT', async () => { await cleanup(); process.exit(130); });
try {
  exitCode = await main();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
  exitCode = 2;
} finally {
  await cleanup();
}
process.exit(exitCode);
