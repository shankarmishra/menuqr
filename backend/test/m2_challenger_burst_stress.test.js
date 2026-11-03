import '../env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB } from '../db.js';
import * as subscriptionService from '../subscriptionService.js';

test('Milestone 2 Challenger: Extreme Concurrency Bursts & Core Invariants Verification', async (suite) => {
  const db = await connectDB(process.env.DATABASE_URL, { runMigrations: false });
  assert.ok(db, 'PostgreSQL connected successfully');

  const testSeqs = ['2070_71', '2071_72', '2072_73', '2073_74'];

  suite.after(async () => {
    for (const seq of testSeqs) {
      await db.query(`DROP SEQUENCE IF EXISTS gst_invoice_seq_${seq};`).catch(() => {});
    }
  });

  // =========================================================================
  // 1. Extreme Parallel Bursts on Uncreated FY Sequences
  // =========================================================================
  await suite.test('1. Extreme Parallel Bursts on Uncreated FY Sequences', async (t) => {
    await t.test('1.1 50 concurrent requests on uncreated FY sequence (2070-71) must yield 100% success with zero rejections', async () => {
      const fy = '2070-71';
      const CONCURRENCY = 50;

      // Drop sequence before test to simulate brand new FY rollover
      await db.query('DROP SEQUENCE IF EXISTS gst_invoice_seq_2070_71;');

      const settled = await Promise.allSettled(
        Array.from({ length: CONCURRENCY }, () =>
          subscriptionService.getNextInvoiceSequence(db, fy)
        )
      );

      const fulfilled = settled.filter(s => s.status === 'fulfilled').map(s => s.value);
      const rejected = settled.filter(s => s.status === 'rejected').map(s => s.reason);

      // CRITICAL ASSERTION: Zero rejections tolerated. The catch on 23505 and 42P07 must absorb catalog collisions.
      assert.equal(rejected.length, 0, `Expected 0 rejections, but got ${rejected.length}: ${rejected[0]?.message}`);
      assert.equal(fulfilled.length, CONCURRENCY, `All ${CONCURRENCY} requests must fulfill successfully`);

      // Uniqueness and contiguous check
      const uniqueSet = new Set(fulfilled);
      assert.equal(uniqueSet.size, CONCURRENCY, `All ${CONCURRENCY} sequence numbers must be distinct`);

      const sorted = [...fulfilled].sort((a, b) => a - b);
      assert.equal(sorted[0], 1, 'First sequence number must be 1');
      assert.equal(sorted[CONCURRENCY - 1], CONCURRENCY, `Last sequence number must be ${CONCURRENCY}`);

      for (let i = 1; i < sorted.length; i++) {
        assert.equal(sorted[i] - sorted[i - 1], 1, `Monotonic gapless sequence required between ${sorted[i - 1]} and ${sorted[i]}`);
      }
    });

    await t.test('1.2 100 concurrent requests on uncreated FY sequence (2071-72) must yield 100% success with zero rejections', async () => {
      const fy = '2071-72';
      const CONCURRENCY = 100;

      await db.query('DROP SEQUENCE IF EXISTS gst_invoice_seq_2071_72;');

      const settled = await Promise.allSettled(
        Array.from({ length: CONCURRENCY }, () =>
          subscriptionService.getNextInvoiceSequence(db, fy)
        )
      );

      const fulfilled = settled.filter(s => s.status === 'fulfilled').map(s => s.value);
      const rejected = settled.filter(s => s.status === 'rejected').map(s => s.reason);

      assert.equal(rejected.length, 0, `Expected 0 rejections under 100-concurrency burst, got ${rejected.length}`);
      assert.equal(fulfilled.length, CONCURRENCY);

      const uniqueSet = new Set(fulfilled);
      assert.equal(uniqueSet.size, CONCURRENCY);

      const sorted = [...fulfilled].sort((a, b) => a - b);
      assert.equal(sorted[0], 1);
      assert.equal(sorted[CONCURRENCY - 1], CONCURRENCY);
    });

    await t.test('1.3 Multi-FY interleaved parallel burst: 50 requests on 2072-73 and 50 on 2073-74 simultaneously', async () => {
      const fyA = '2072-73';
      const fyB = '2073-74';

      await db.query('DROP SEQUENCE IF EXISTS gst_invoice_seq_2072_73;');
      await db.query('DROP SEQUENCE IF EXISTS gst_invoice_seq_2073_74;');

      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push(subscriptionService.getNextInvoiceSequence(db, fyA));
        requests.push(subscriptionService.getNextInvoiceSequence(db, fyB));
      }

      const settled = await Promise.allSettled(requests);
      const fulfilled = settled.filter(s => s.status === 'fulfilled').map(s => s.value);
      const rejected = settled.filter(s => s.status === 'rejected').map(s => s.reason);

      assert.equal(rejected.length, 0, 'No rejections in interleaved dual-FY burst');
      assert.equal(fulfilled.length, 100);

      // Verify each sequence independently produced 1..50
      const resA = await db.query(`SELECT last_value FROM gst_invoice_seq_2072_73;`);
      const resB = await db.query(`SELECT last_value FROM gst_invoice_seq_2073_74;`);
      assert.equal(parseInt(resA.rows[0].last_value, 10), 50);
      assert.equal(parseInt(resB.rows[0].last_value, 10), 50);
    });

    await t.test('1.4 Error catch verification: 23505 and 42P07 are absorbed; other errors are re-thrown', async () => {
      // Create a mock client that throws 23505 on CREATE SEQUENCE
      let nextvalCalled = false;
      const mock23505Client = {
        query: async (sql) => {
          if (sql.includes('CREATE SEQUENCE')) {
            const err = new Error('duplicate key value violates unique constraint "pg_class_relname_nsp_index"');
            err.code = '23505';
            throw err;
          }
          if (sql.includes('nextval')) {
            nextvalCalled = true;
            return { rows: [{ seq: '42' }] };
          }
          return { rows: [] };
        },
      };

      const seq23505 = await subscriptionService.getNextInvoiceSequence(mock23505Client, '2026-27');
      assert.equal(seq23505, 42);
      assert.ok(nextvalCalled, 'nextval must be called after catching 23505');

      // Create a mock client that throws 42P07 on CREATE SEQUENCE
      let nextvalCalled42P07 = false;
      const mock42P07Client = {
        query: async (sql) => {
          if (sql.includes('CREATE SEQUENCE')) {
            const err = new Error('relation already exists');
            err.code = '42P07';
            throw err;
          }
          if (sql.includes('nextval')) {
            nextvalCalled42P07 = true;
            return { rows: [{ seq: '88' }] };
          }
          return { rows: [] };
        },
      };

      const seq42P07 = await subscriptionService.getNextInvoiceSequence(mock42P07Client, '2026-27');
      assert.equal(seq42P07, 88);
      assert.ok(nextvalCalled42P07, 'nextval must be called after catching 42P07');

      // Create a mock client that throws a DIFFERENT error (e.g. 42501 permission denied)
      const mockPermClient = {
        query: async (sql) => {
          if (sql.includes('CREATE SEQUENCE')) {
            const err = new Error('permission denied for schema public');
            err.code = '42501';
            throw err;
          }
          return { rows: [{ seq: '1' }] };
        },
      };

      await assert.rejects(
        () => subscriptionService.getNextInvoiceSequence(mockPermClient, '2026-27'),
        (err) => {
          assert.equal(err.code, '42501');
          return true;
        },
        'Non-concurrency errors must NOT be swallowed'
      );
    });
  });

  // =========================================================================
  // 2. Proration Floor & Boundary Invariants
  // =========================================================================
  await suite.test('2. Proration Floor & Boundary Invariants', async (t) => {
    await t.test('2.1 Floor enforcement at exactly 100 paise (Rs. 1.00) subtotal', () => {
      // When credit exceeds target price by huge margin
      const resLargeCredit = subscriptionService.calculateProrationPaise(1000000, 365, 50000, 'Maharashtra');
      assert.equal(resLargeCredit.subtotalPaise, 100, 'Subtotal must be clamped to minimum floor of 100 paise');
      assert.equal(resLargeCredit.cgstPaise, 9, 'CGST 9% of 100 is 9 paise');
      assert.equal(resLargeCredit.sgstPaise, 9, 'SGST 9% of 100 is 9 paise');
      assert.equal(resLargeCredit.totalDuePaise, 118, 'Total must be 118 paise (Rs. 1.18)');

      // Exact boundary tests
      // Target = 1000 paise
      // credit = 899 -> subtotal = 101 paise (> 100, untouched)
      const r101 = subscriptionService.calculateProrationPaise(365 * 899, 1, 1000, 'Maharashtra');
      assert.equal(r101.subtotalPaise, 101);

      // credit = 900 -> subtotal = 100 paise (exact floor)
      const r100 = subscriptionService.calculateProrationPaise(365 * 900, 1, 1000, 'Maharashtra');
      assert.equal(r100.subtotalPaise, 100);

      // credit = 901 -> subtotal = 100 paise (clamped from 99)
      const r99 = subscriptionService.calculateProrationPaise(365 * 901, 1, 1000, 'Maharashtra');
      assert.equal(r99.subtotalPaise, 100);

      // credit = 1000 -> subtotal = 100 paise (clamped from 0)
      const r0 = subscriptionService.calculateProrationPaise(365 * 1000, 1, 1000, 'Maharashtra');
      assert.equal(r0.subtotalPaise, 100);
    });

    await t.test('2.2 Inter-state vs Intra-state tax calculations on floor and regular amounts', () => {
      // Intra-state (Maharashtra): 9% CGST + 9% SGST
      const intra = subscriptionService.calculateGstTax({ subtotalPaise: 10000, customerState: 'Maharashtra' });
      assert.equal(intra.cgstPaise, 900);
      assert.equal(intra.sgstPaise, 900);
      assert.equal(intra.igstPaise, 0);
      assert.equal(intra.taxPaise, 1800);
      assert.equal(intra.totalPaise, 11800);

      // Inter-state (Karnataka): 18% IGST
      const inter = subscriptionService.calculateGstTax({ subtotalPaise: 10000, customerState: 'Karnataka' });
      assert.equal(inter.cgstPaise, 0);
      assert.equal(inter.sgstPaise, 0);
      assert.equal(inter.igstPaise, 1800);
      assert.equal(inter.taxPaise, 1800);
      assert.equal(inter.totalPaise, 11800);
    });

    await t.test('2.3 Prototype injection immunity in calculateProration', () => {
      // Prototypical properties must throw an error, not resolve Object.prototype
      assert.throws(
        () => subscriptionService.calculateProration({ currentPlanId: 'basic', targetPlanId: '__proto__' }),
        /Invalid target plan/
      );
      assert.throws(
        () => subscriptionService.calculateProration({ currentPlanId: 'basic', targetPlanId: 'constructor' }),
        /Invalid target plan/
      );
      assert.throws(
        () => subscriptionService.calculateProration({ currentPlanId: 'basic', targetPlanId: 'toString' }),
        /Invalid target plan/
      );
    });

    await t.test('2.4 Same-tier and downgrade attempts rejected', () => {
      const samePlan = subscriptionService.calculateProration({
        currentPlanId: 'intermediate',
        targetPlanId: 'intermediate',
      });
      assert.equal(samePlan.isUpgradeAllowed, false);
      assert.match(samePlan.reason, /identical|already on the highest/i);

      const downgrade = subscriptionService.calculateProration({
        currentPlanId: 'premium',
        targetPlanId: 'intermediate',
      });
      assert.equal(downgrade.isUpgradeAllowed, false);
      assert.match(downgrade.reason, /downgrade/i);
    });
  });

  // =========================================================================
  // 3. Zero-Loss Renewal Invariants
  // =========================================================================
  await suite.test('3. Zero-Loss Renewal Invariants', async (t) => {
    await t.test('3.1 Active plan renewal adds 365 days strictly to currentExpiry (zero days lost)', () => {
      const now = new Date('2026-05-01T12:00:00.000Z');
      const currentExpiry = new Date('2026-06-15T12:00:00.000Z'); // 45 days remaining

      const result = subscriptionService.calculateRenewalExpiry(currentExpiry, now);

      assert.equal(result.baseDate.toISOString(), currentExpiry.toISOString(), 'Base date must be currentExpiry');
      assert.equal(result.getFullYear(), 2027);
      assert.equal(result.getMonth(), 5); // June (0-indexed 5)
      assert.equal(result.getDate(), 15);
      assert.equal(result.toISOString(), '2027-06-15T12:00:00.000Z');
      assert.equal(result.daysExtended, 365);
    });

    await t.test('3.2 Expired plan renewal starts strictly from now (no past penalization)', () => {
      const now = new Date('2026-05-01T12:00:00.000Z');
      const currentExpiry = new Date('2026-03-01T12:00:00.000Z'); // Expired 2 months ago

      const result = subscriptionService.calculateRenewalExpiry(currentExpiry, now);

      assert.equal(result.baseDate.toISOString(), now.toISOString(), 'Base date must be now');
      assert.equal(result.toISOString(), '2027-05-01T12:00:00.000Z');
      assert.equal(result.daysExtended, 365);
    });

    await t.test('3.3 Multi-cycle consecutive renewals stack deterministically', () => {
      const now = new Date('2026-01-01T00:00:00.000Z');
      let expiry = new Date('2026-06-01T00:00:00.000Z');

      for (let i = 1; i <= 5; i++) {
        expiry = subscriptionService.calculateRenewalExpiry(expiry, now);
        assert.equal(expiry.getFullYear(), 2026 + i);
        assert.equal(expiry.getMonth(), 5); // June
        assert.equal(expiry.getDate(), 1);
      }
      assert.equal(expiry.toISOString(), '2031-06-01T00:00:00.000Z');
    });

    await t.test('3.4 Leap day expiration handling (February 29)', () => {
      // Leap year 2028: Feb 29
      const leapExpiry = new Date('2028-02-29T12:00:00.000Z');
      const now = new Date('2028-01-01T00:00:00.000Z');

      const result = subscriptionService.calculateRenewalExpiry(leapExpiry, now);
      // In JS, adding 1 year to 2028-02-29 rolls to 2029-02-28 or 2029-03-01 depending on engine.
      // JS Date setFullYear(2029) on Feb 29 sets month to March 1 (or Feb 28 depending on day rollover).
      assert.ok(result.getFullYear() === 2029, 'Year must advance to 2029');
      assert.ok(result.getTime() > leapExpiry.getTime(), 'New expiry must be in the future');
    });
  });
});
