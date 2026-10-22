import '../env.js';
import { pool } from '../db.js';
import { processOrderPaymentAndProvision, PLANS, makePlanKey } from '../routes/purchase.js';
import { sendActivationEmail, sendPaymentSuccessEmail } from '../email.js';

export async function reconcilePaidOrders({ dryRun = true } = {}) {
  console.log(`[reconcile] Starting purchase reconciliation audit (dryRun=${dryRun})...`);

  // 1. Find PAID orders that are FAILED, stale PROCESSING (>5m), or COMPLETE with missing emails
  const paidOrdersRes = await pool.query(`
    SELECT o.id, o.customer_email, o.customer_name, o.business_name, o.plan_id, o.amount, o.status,
           o.provisioning_status, o.activation_email_sent, o.payment_receipt_email_sent, o.metadata, o.created_at, o.updated_at
    FROM orders o
    WHERE o.status = 'PAID'
      AND (
        o.provisioning_status = 'FAILED'
        OR (o.provisioning_status = 'PROCESSING' AND o.updated_at < NOW() - INTERVAL '5 minutes')
        OR (o.provisioning_status = 'COMPLETE' AND (o.activation_email_sent = false OR o.payment_receipt_email_sent = false))
      )
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
      remediated: false,
    };

    if (order.provisioning_status !== 'COMPLETE') {
      itemReport.actionNeeded.push('PROVISION_ACCOUNT');
      if (!dryRun) {
        console.log(`[reconcile] Retrying provisioning for order ${order.id}...`);
        try {
          const result = await processOrderPaymentAndProvision({
            orderId: order.id,
            gatewayUsed: 'reconciliation',
            transactionId: order.metadata?.transaction_id || order.id,
            isWebhook: true,
            webhookVerified: true,
          });
          itemReport.provisionResult = result;
          if (result?.provisioning_status === 'COMPLETE') {
            console.log(`[reconcile] Successfully provisioned order ${order.id}`);
            itemReport.remediated = true;
            itemReport.provisioningStatus = 'COMPLETE';
          } else {
            console.warn(`[reconcile] Provisioning retry returned status ${result?.provisioning_status} for order ${order.id}`);
          }
        } catch (err) {
          console.error(`[reconcile] Failed provisioning retry for order ${order.id}:`, err.message);
          itemReport.error = err.message;
        }
      }
    }

    if (!order.activation_email_sent) {
      itemReport.actionNeeded.push('REQUEUE_ACTIVATION_EMAIL');
    }
    if (!order.payment_receipt_email_sent) {
      itemReport.actionNeeded.push('REQUEUE_RECEIPT_EMAIL');
    }

    // If order was already COMPLETE (or just became COMPLETE) but emails remain unsent:
    if ((order.provisioning_status === 'COMPLETE' || itemReport.provisioningStatus === 'COMPLETE') &&
        (!order.activation_email_sent || !order.payment_receipt_email_sent)) {
      if (!dryRun) {
        const planMeta = PLANS[makePlanKey(order.plan_id)] || {};
        let actSent = order.activation_email_sent;
        let recSent = order.payment_receipt_email_sent;

        if (!actSent) {
          try {
            await sendActivationEmail({
              email: order.customer_email,
              ownerName: order.customer_name,
              businessName: order.business_name,
              plan: planMeta.label || order.plan_id.toUpperCase(),
            });
            actSent = true;
          } catch (err) {
            console.error(`[reconcile] Failed sending activation email for order ${order.id}:`, err.message);
          }
        }

        if (!recSent) {
          try {
            await sendPaymentSuccessEmail({
              email: order.customer_email,
              businessName: order.business_name,
              plan: planMeta.label || order.plan_id.toUpperCase(),
              amount: order.amount,
            });
            recSent = true;
          } catch (err) {
            console.error(`[reconcile] Failed sending receipt email for order ${order.id}:`, err.message);
          }
        }

        await pool.query(
          'UPDATE orders SET activation_email_sent = $1, payment_receipt_email_sent = $2 WHERE id = $3',
          [actSent, recSent, order.id]
        );
        itemReport.activationEmailSent = actSent;
        itemReport.paymentReceiptEmailSent = recSent;
      }
    }

    report.push(itemReport);
    console.log(`- Order ${order.id} (${maskedEmail}): actions=[${itemReport.actionNeeded.join(', ')}]`);
  }

  if (dryRun) {
    console.log(`[reconcile] Dry run complete. ${report.length} records audited. No database mutations performed.`);
  } else {
    console.log(`[reconcile] Remediation execution complete. ${report.length} records processed.`);
  }

  return report;
}

if (process.argv[1] && process.argv[1].endsWith('reconcile-purchases.js')) {
  const isLive = process.argv.includes('--execute');
  reconcilePaidOrders({ dryRun: !isLive })
    .catch((err) => {
      console.error('[reconcile] Failed:', err.message);
      process.exit(1);
    })
    .finally(async () => {
      await pool.end().catch(() => {});
    });
}
