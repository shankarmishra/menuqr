import test from 'node:test';
import assert from 'node:assert/strict';
import { setPool, pool } from '../db.js';
import { processOrderPaymentAndProvision } from '../routes/purchase.js';

test('Batch 2 #6: Provisioning race — concurrent worker only reports alreadyProvisioned when COMPLETE', async (t) => {
  const originalPool = pool;
  t.afterEach(() => {
    setPool(originalPool);
  });

  await t.test('Worker B concurrent with Worker A must only return alreadyProvisioned when COMPLETE, not PROCESSING', async () => {
    let orderState = {
      id: 'order_race_test_123',
      customer_name: 'Race User',
      customer_email: 'race@example.com',
      business_name: 'Race Diner',
      plan_id: 'starter',
      amount: 1499,
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PENDING',
      metadata: {},
      activation_email_sent: false,
      payment_receipt_email_sent: false,
    };

    let workerAProcessingStarted = false;
    let workerAFinished = false;

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) {
          return { rows: [{ ...orderState }] };
        }
        if (sql.includes('SELECT status, provisioning_status')) {
          return { rows: [{ ...orderState }] };
        }
        if (sql.includes('UPDATE orders') && sql.includes("provisioning_status='PROCESSING'")) {
          if (orderState.provisioning_status === 'PENDING') {
            orderState.provisioning_status = 'PROCESSING';
            orderState.metadata = { lock_token: params[1] };
            workerAProcessingStarted = true;
            return { rowCount: 1 };
          }
          return { rowCount: 0 };
        }
        if (sql.includes('INSERT INTO users')) {
          // Simulate Worker A doing async provisioning work (100ms)
          await new Promise((r) => setTimeout(r, 100));
          return { rows: [] };
        }
        if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
        if (sql.includes('SELECT id FROM clients')) return { rows: [] };
        if (sql.includes('INSERT INTO clients')) return { rows: [] };
        if (sql.includes('INSERT INTO subscriptions')) return { rows: [] };
        if (sql.includes('SELECT expires_at FROM subscriptions')) return { rows: [{ expires_at: new Date() }] };
        if (sql.includes('INSERT INTO email_outbox')) return { rows: [{ id: 'outbox_1' }] };
        if (sql.includes('INSERT INTO activity_logs')) return { rows: [] };

        if (sql.includes("SET provisioning_status='COMPLETE'")) {
          orderState.status = 'PAID';
          orderState.provisioning_status = 'COMPLETE';
          workerAFinished = true;
          return { rowCount: 1 };
        }
        if (sql.includes('UPDATE orders SET activation_email_sent')) {
          orderState.activation_email_sent = true;
          orderState.payment_receipt_email_sent = true;
          return { rowCount: 1 };
        }
        return { rows: [], rowCount: 1 };
      },
      connect: async () => ({
        query: async (sql, params) => {
          if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] };
          if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
          if (sql.includes('INSERT INTO users')) {
            await new Promise((r) => setTimeout(r, 100));
            return { rows: [] };
          }
          if (sql.includes('SELECT id FROM clients')) return { rows: [] };
          if (sql.includes('INSERT INTO clients')) return { rows: [] };
          if (sql.includes('INSERT INTO subscriptions')) return { rows: [] };
          if (sql.includes('INSERT INTO activity_logs')) return { rows: [] };
          if (sql.includes("SET provisioning_status='COMPLETE'")) {
            orderState.status = 'PAID';
            orderState.provisioning_status = 'COMPLETE';
            workerAFinished = true;
            return { rowCount: 1 };
          }
          return { rows: [], rowCount: 1 };
        },
        release: () => {}
      })
    });

    // Start Worker A
    const workerAPromise = processOrderPaymentAndProvision({
      orderId: 'order_race_test_123',
      gatewayUsed: 'mock',
      transactionId: 'tx_a',
      mockSuccess: true,
    });

    // Wait 20ms until Worker A has locked the order into PROCESSING
    while (!workerAProcessingStarted) {
      await new Promise((r) => setTimeout(r, 5));
    }

    // Now fire Worker B concurrently while Worker A is still working in background
    assert.equal(workerAFinished, false, 'Worker A should still be actively provisioning');
    assert.equal(orderState.provisioning_status, 'PROCESSING');

    const resultB = await processOrderPaymentAndProvision({
      orderId: 'order_race_test_123',
      gatewayUsed: 'mock',
      transactionId: 'tx_b',
      mockSuccess: true,
    });

    const resultA = await workerAPromise;

    // Worker A must finish successfully
    assert.equal(resultA.success, true);
    assert.equal(resultA.provisioning_status, 'COMPLETE');

    // Worker B must NOT have returned alreadyProvisioned: true while it was PROCESSING!
    // Worker B should report COMPLETE once Worker A finished.
    assert.notEqual(
      resultB.provisioning_status,
      'PROCESSING',
      'Worker B returned while status was still PROCESSING! Race condition detected.'
    );
    assert.equal(resultB.provisioning_status, 'COMPLETE');
    assert.equal(resultB.alreadyProvisioned, true);
  });

  await t.test('If Worker A fails provisioning, Worker B must NOT report alreadyProvisioned: true', async () => {
    let orderState = {
      id: 'order_fail_test_123',
      customer_name: 'Fail User',
      customer_email: 'fail@example.com',
      business_name: 'Fail Diner',
      plan_id: 'starter',
      amount: 1499,
      status: 'PENDING_PAYMENT',
      provisioning_status: 'PENDING',
      metadata: {},
    };

    let workerAStarted = false;

    setPool({
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) return { rows: [{ ...orderState }] };
        if (sql.includes('SELECT status, provisioning_status')) return { rows: [{ ...orderState }] };
        if (sql.includes('UPDATE orders') && sql.includes("provisioning_status='PROCESSING'")) {
          if (orderState.provisioning_status === 'PENDING') {
            orderState.provisioning_status = 'PROCESSING';
            orderState.metadata = { lock_token: params[1] };
            workerAStarted = true;
            return { rowCount: 1 };
          }
          return { rowCount: 0 };
        }
        if (sql.includes("SET provisioning_status='FAILED'")) {
          orderState.provisioning_status = 'FAILED';
          return { rowCount: 1 };
        }
        return { rows: [], rowCount: 1 };
      },
      connect: async () => ({
        query: async (sql) => {
          if (sql === 'BEGIN') return { rows: [] };
          if (sql.includes('SELECT id, tenant_id FROM users')) {
            await new Promise((r) => setTimeout(r, 80));
            throw new Error('Database disk error during tenant setup');
          }
          if (sql === 'ROLLBACK') return { rows: [] };
          return { rows: [], rowCount: 1 };
        },
        release: () => {}
      })
    });

    const promiseA = processOrderPaymentAndProvision({
      orderId: 'order_fail_test_123',
      gatewayUsed: 'mock',
      mockSuccess: true,
    });

    while (!workerAStarted) {
      await new Promise((r) => setTimeout(r, 5));
    }

    const resultB = await processOrderPaymentAndProvision({
      orderId: 'order_fail_test_123',
      gatewayUsed: 'mock',
      mockSuccess: true,
    });

    await promiseA;

    // Worker B must NOT say alreadyProvisioned: true when Worker A failed!
    assert.equal(
      resultB.alreadyProvisioned,
      false,
      'Worker B reported alreadyProvisioned: true even though provisioning failed!'
    );
  });
});
