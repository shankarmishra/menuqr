import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const directory = dirname(fileURLToPath(import.meta.url));
const result = loadEnv({ path: join(directory, '.env') });
if (result.parsed) {
  console.log(`\u26A1 injected env (${Object.keys(result.parsed).length}) from .env`);
}
