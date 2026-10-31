// Shared by the orchestrator (run-gate.mjs), the Playwright config and the specs.
// Pure ESM, no TypeScript, so Node can import it directly.
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
export const gateRoot = resolve(here, '..'); // frontend/e2e-gate
export const frontendRoot = resolve(gateRoot, '..'); // frontend
export const gateRepoRoot = resolve(frontendRoot, '..'); // the checkout that holds this gate

/** The checkout whose backend and frontend are started and tested (default: the checkout holding the gate). */
export function appRoot() {
  return resolve(process.env.GATE_APP_ROOT || gateRepoRoot);
}

/** Root of the main checkout (the parent of the shared .git dir), or null when git is unavailable. */
export function mainCheckoutRoot() {
  try {
    const common = execFileSync('git', ['rev-parse', '--git-common-dir'], { cwd: gateRepoRoot, encoding: 'utf8' }).trim();
    return resolve(gateRepoRoot, common, '..');
  } catch {
    return null;
  }
}

/** Where QA output (screenshots, JSON results, logs, generated fixtures) is written. Not tracked by git. */
export function outDir() {
  if (process.env.GATE_OUT_DIR) return resolve(process.env.GATE_OUT_DIR);
  const main = mainCheckoutRoot();
  return join(main && existsSync(join(main, 'docs')) ? main : gateRepoRoot, 'docs', 'qa');
}

/** Optional real client logos (local only, never copied into git). */
export function realLogoDir() {
  if (process.env.GATE_REAL_LOGO_DIR) return resolve(process.env.GATE_REAL_LOGO_DIR);
  const main = mainCheckoutRoot();
  return main ? join(main, 'docs', 'reference-assets', 'client-logos') : '';
}

export const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/** Throws unless the URL points at a localhost menuqr_e2e* scratch database. Returns a printable label (no credentials). */
export function assertScratchDbUrl(urlString) {
  let u;
  try {
    u = new URL(urlString);
  } catch {
    throw new Error('E2E database URL is not a valid URL.');
  }
  if (!LOCAL_HOSTS.has(u.hostname)) {
    throw new Error(`Refusing to run: database host "${u.hostname}" is not localhost.`);
  }
  const name = decodeURIComponent(u.pathname.replace(/^\/+/, ''));
  if (!/^menuqr_e2e[a-z0-9_]*$/.test(name)) {
    throw new Error(`Refusing to run: database "${name}" is not a menuqr_e2e* scratch database.`);
  }
  return { host: u.hostname, port: u.port || '5432', name, label: `${u.hostname}:${u.port || '5432'}/${name}` };
}

function readEnvFileValue(file, key) {
  if (!existsSync(file)) return '';
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*)$`));
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return '';
}

/**
 * Credentials for the local Postgres server, used ONLY to create/drop the scratch database.
 * Order: E2E_PG_ADMIN_URL, DATABASE_URL in the environment, backend/.env of the tested checkout,
 * backend/.env of the main checkout. The value is never printed and the database name is replaced.
 */
export function resolveServerUrl() {
  const candidates = [
    process.env.E2E_PG_ADMIN_URL,
    process.env.DATABASE_URL,
    readEnvFileValue(join(appRoot(), 'backend', '.env'), 'DATABASE_URL'),
    (() => {
      const main = mainCheckoutRoot();
      return main ? readEnvFileValue(join(main, 'backend', '.env'), 'DATABASE_URL') : '';
    })(),
  ].filter(Boolean);
  if (candidates.length === 0) {
    throw new Error('No Postgres credentials found. Set E2E_PG_ADMIN_URL (a localhost URL that may CREATE DATABASE).');
  }
  const u = new URL(candidates[0]);
  if (!LOCAL_HOSTS.has(u.hostname)) {
    throw new Error(`Refusing to run: the Postgres host "${u.hostname}" is not localhost.`);
  }
  return u;
}

export function scratchDbName() {
  return process.env.E2E_DB_NAME || 'menuqr_e2e';
}

/** Full URL of the scratch database (credentials from the local server URL, database name replaced). */
export function scratchDbUrl() {
  if (process.env.E2E_DATABASE_URL) return process.env.E2E_DATABASE_URL;
  const u = new URL(resolveServerUrl().toString());
  u.pathname = `/${scratchDbName()}`;
  return u.toString();
}

export function adminDbUrl() {
  const u = new URL(resolveServerUrl().toString());
  u.pathname = '/postgres';
  return u.toString();
}

/** pg from the backend's node_modules (the frontend does not depend on it). */
export function requirePg() {
  return createRequire(join(appRoot(), 'backend', 'package.json'))('pg');
}

export const ports = {
  api: Number(process.env.GATE_API_PORT || 3411),
  web: Number(process.env.GATE_WEB_PORT || 5474),
};

export function urls() {
  const base = process.env.BASE_URL || `http://127.0.0.1:${ports.web}`;
  const api = process.env.API_URL || `http://127.0.0.1:${ports.api}`;
  return { base: base.replace(/\/$/, ''), api: api.replace(/\/$/, '') };
}
