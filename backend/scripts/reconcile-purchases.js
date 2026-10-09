import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

function loadEnv(envPath) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
}

loadEnv(path.resolve(process.cwd(), '.env'));
loadEnv(path.resolve(process.cwd(), 'backend/.env'));

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('No DATABASE_URL found.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });

export async function reconcilePaidOrders({ dryRun = true } = {}) {
  console.log(`[reconcile] Starting purchase reconciliation audit (dryRun=${dryRun})...`);

  // 1. Find PAID orders where email flags are false or outbox jobs failed
  const paidOrdersRes = await pool.query(`
    SELECT o.id, o.customer_email, o.customer_name, o.business_name, o.plan_id, o.amount, o.status,
           o.provisioning_status, o.activation_email_sent, o.payment_receipt_email_sent, o.created_at
    FROM orders o
    WHERE o.status = 'PAID'
      AND (o.activation_email_sent = false OR o.payment_receipt_email_sent = false OR o.provisioning_status != 'COMPLETE')
    ORDER BY o.created_at DESC
  `);

  console.log(`[reconcile] Found ${paidOrdersRes.rows.length} PAID orders with missing notifications or incomplete provisioning.`);

  const report = [];

  for (const order of paidOrdersRes.rows) {
    const maskedEmail = order.customer_email ? `${order.customer_email[0]}***@${order.customer_email.split('@')[1]}` : '***';
    const itemReport = {
      orderId: order.id,
      customerEmail: maskedEmail,
      businessName: order.business_name,
      plan: order.plan_id,
      status: order.status,
      provisioningStatus: order.provisioning_status,
      activationEmailSent: order.activation_email_sent,
      paymentReceiptEmailSent: order.payment_receipt_email_sent,
      actionNeeded: [],
    };

    if (order.provisioning_status !== 'COMPLETE') {
      itemReport.actionNeeded.push('PROVISION_ACCOUNT');
    }
    if (!order.activation_email_sent) {
      itemReport.actionNeeded.push('REQUEUE_ACTIVATION_EMAIL');
    }
    if (!order.payment_receipt_email_sent) {
      itemReport.actionNeeded.push('REQUEUE_RECEIPT_EMAIL');
    }

    report.push(itemReport);
    console.log(`- Order ${order.id} (${maskedEmail}): actions=[${itemReport.actionNeeded.join(', ')}]`);
  }

  if (dryRun) {
    console.log(`[reconcile] Dry run complete. ${report.length} records audited. No database mutations performed.`);
  }

  await pool.end();
  return report;
}

if (process.argv[1] && process.argv[1].endsWith('reconcile-purchases.js')) {
  const isLive = process.argv.includes('--execute');
  reconcilePaidOrders({ dryRun: !isLive }).catch((err) => {
    console.error('[reconcile] Failed:', err.message);
    process.exit(1);
  });
}
