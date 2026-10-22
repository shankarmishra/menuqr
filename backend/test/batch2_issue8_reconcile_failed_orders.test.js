import test from 'node:test';
import assert from 'node:assert/strict';
import { setPool, pool } from '../db.js';
import { reconcilePaidOrders } from '../scripts/reconcile-purchases.js';

test('Batch 2 #8: Reconcile PAID + FAILED orders retry logic', async (t) => {
  const originalPool = pool;
  t.afterEach(() => {
    setPool(originalPool);
  });

  await t.test('dryRun=true audits but does not mutate order state', async () => {
    const mockOrder = {
      id: 'order_failed_audit_1',
      customer_email: 'audit@example.com',
      customer_name: 'Audit User',
      business_name: 'Audit Cafe',
      plan_id: 'starter',
      amount: 1499,
      status: 'PAID',
      provisioning_status: 'FAILED',
      activation_email_sent: false,
      payment_receipt_email_sent: false,
      created_at: new Date(),
    };

    let mutationExecuted = false;

    setPool({
      query: async (sql) => {
        if (sql.includes('FROM orders o') && sql.includes("o.status = 'PAID'")) {
          return { rows: [mockOrder] };
        }
        if (sql.includes('UPDATE orders') || sql.includes('INSERT INTO users')) {
          mutationExecuted = true;
          return { rowCount: 1 };
        }
        return { rows: [], rowCount: 1 };
      }
    });

    const report = await reconcilePaidOrders({ dryRun: true });
    assert.equal(report.length, 1);
    assert.equal(report[0].orderId, 'order_failed_audit_1');
    assert.ok(report[0].actionNeeded.includes('PROVISION_ACCOUNT'));
    assert.equal(mutationExecuted, false, 'dryRun must not perform mutations');
  });

  await t.test('dryRun=false must actively retry provisioning and transition order to COMPLETE', async () => {
    let orderState = {
      id: 'order_failed_retry_1',
      customer_email: 'retry@example.com',
      customer_name: 'Retry User',
      business_name: 'Retry Bistro',
      plan_id: 'starter',
      amount: 1499,
      status: 'PAID',
      provisioning_status: 'FAILED',
      activation_email_sent: false,
      payment_receipt_email_sent: false,
      metadata: {},
      created_at: new Date(),
    };

    let userInserted = false;
    let clientInserted = false;

    setPool({
      query: async (sql, params) => {
        if (sql.includes('FROM orders o') && sql.includes("o.status = 'PAID'")) {
          return { rows: [{ ...orderState }] };
        }
        if (sql.includes('SELECT * FROM orders WHERE id = $1')) {
          return { rows: [{ ...orderState }] };
        }
        if (sql.includes('SELECT status, provisioning_status')) {
          return { rows: [{ ...orderState }] };
        }
        if (sql.includes('UPDATE orders') && sql.includes("provisioning_status='PROCESSING'")) {
          orderState.provisioning_status = 'PROCESSING';
          return { rowCount: 1 };
        }
        if (sql.includes('INSERT INTO users')) {
          userInserted = true;
          return { rows: [] };
        }
        if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
        if (sql.includes('SELECT id FROM clients')) return { rows: [] };
        if (sql.includes('INSERT INTO clients')) {
          clientInserted = true;
          return { rows: [] };
        }
        if (sql.includes('INSERT INTO subscriptions')) return { rows: [] };
        if (sql.includes('SELECT expires_at FROM subscriptions')) return { rows: [{ expires_at: new Date() }] };
        if (sql.includes('INSERT INTO email_outbox')) return { rows: [{ id: 'outbox_retry_1' }] };
        if (sql.includes('INSERT INTO activity_logs')) return { rows: [] };
        if (sql.includes("SET provisioning_status='COMPLETE'")) {
          orderState.provisioning_status = 'COMPLETE';
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
        query: async (sql) => {
          if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [] };
          if (sql.includes('SELECT id, tenant_id FROM users')) return { rows: [] };
          if (sql.includes('INSERT INTO users')) {
            userInserted = true;
            return { rows: [] };
          }
          if (sql.includes('SELECT id FROM clients')) return { rows: [] };
          if (sql.includes('INSERT INTO clients')) {
            clientInserted = true;
            return { rows: [] };
          }
          if (sql.includes('INSERT INTO subscriptions')) return { rows: [] };
          if (sql.includes('INSERT INTO activity_logs')) return { rows: [] };
          if (sql.includes("SET provisioning_status='COMPLETE'")) {
            orderState.provisioning_status = 'COMPLETE';
            return { rowCount: 1 };
          }
          return { rows: [], rowCount: 1 };
        },
        release: () => {}
      })
    });

    const report = await reconcilePaidOrders({ dryRun: false });

    // In current un-implemented code, dryRun=false does nothing, so orderState.provisioning_status remains FAILED!
    assert.equal(report.length, 1);
    assert.equal(
      orderState.provisioning_status,
      'COMPLETE',
      'Order with PAID + FAILED status was NOT recovered to COMPLETE by reconciliation!'
    );
    assert.equal(userInserted, true, 'User record should have been provisioned');
    assert.equal(clientInserted, true, 'Client record should have been provisioned');
  });
});
