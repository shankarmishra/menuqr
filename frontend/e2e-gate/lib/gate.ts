import { test as base, expect, type TestInfo } from '@playwright/test';
import { appendFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { outDir } from './gate-env.mjs';

const resultsDir = join(outDir(), 'results');
const ledgerFile = join(resultsDir, 'checks.jsonl');

function clean(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error);
  return text.replace(/\u001b\[[0-9;]*m/g, '').replace(/\s+\n/g, '\n').trim().slice(0, 700);
}

/**
 * A check ledger: every assertion block is recorded as one named "check" (pass / fail / skip) so the gate
 * can report real counts, and a failing check does not hide the checks after it. The test fails at the end
 * if any check failed.
 */
export class Gate {
  readonly failures: string[] = [];
  constructor(private readonly info: TestInfo) {
    mkdirSync(dirname(ledgerFile), { recursive: true });
  }

  private write(entry: Record<string, unknown>) {
    appendFileSync(ledgerFile, `${JSON.stringify({ ...entry, spec: this.info.file.split(/[\\/]/).pop(), test: this.info.title, at: new Date().toISOString() })}\n`);
  }

  async check(id: string, desc: string, fn: () => unknown | Promise<unknown>): Promise<boolean> {
    try {
      await fn();
      this.write({ id, desc, status: 'pass' });
      return true;
    } catch (error) {
      const message = clean(error);
      this.failures.push(`${id}: ${message.split('\n')[0]}`);
      this.write({ id, desc, status: 'fail', error: message });
      return false;
    }
  }

  skip(id: string, desc: string, reason: string) {
    this.write({ id, desc, status: 'skip', error: reason });
  }

  /** Record a failure found by code that is not an assertion (for example a console error list). */
  fail(id: string, desc: string, message: string) {
    this.failures.push(`${id}: ${message}`);
    this.write({ id, desc, status: 'fail', error: message });
  }

  pass(id: string, desc: string) {
    this.write({ id, desc, status: 'pass' });
  }

  finish() {
    if (this.failures.length > 0) {
      throw new Error(`${this.failures.length} check(s) failed:\n - ${this.failures.join('\n - ')}`);
    }
  }
}

export const test = base.extend<{ g: Gate }>({
  g: async ({}, use, testInfo) => {
    const gate = new Gate(testInfo);
    await use(gate);
    gate.finish();
  },
});

export { expect };

export type World = {
  api: string;
  base: string;
  outDir: string;
  tenants: Record<string, { tenantId: string; userId: string; publicId: string; slug: string; email: string; password: string; plan: string; qrId: string | null; businessName: string; itemCount: number; categoryCount: number }>;
  fixtures: { workbook: string; logos: Record<string, string>; realLogos: string[]; expected: Record<string, any>; social: string };
};

export function loadWorld(): World {
  const file = join(outDir(), 'results', 'world.json');
  if (!existsSync(file)) throw new Error(`world.json missing (${file}); global setup did not run.`);
  return JSON.parse(readFileSync(file, 'utf8'));
}
