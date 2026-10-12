import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';

const directory = dirname(fileURLToPath(import.meta.url));

const isTest =
  process.env.NODE_ENV === 'test' ||
  process.execArgv.some(arg => arg.includes('test')) ||
  process.argv.some(arg => arg.includes('test'));

if (isTest && existsSync(join(directory, '.env.test'))) {
  loadEnv({ path: join(directory, '.env.test'), override: true });
} else {
  loadEnv({ path: join(directory, '.env') });
}

if (isTest && process.env.DATABASE_URL) {
  try {
    const parsed = new URL(process.env.DATABASE_URL);
    const dbName = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
    if (!/(?:^|[_-])test(?:$|[_-])/i.test(dbName)) {
      parsed.pathname = `/${dbName}_test`;
      process.env.DATABASE_URL = parsed.toString();
    }
  } catch {}
}
