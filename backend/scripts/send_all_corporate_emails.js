import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  sendClientWelcomeEmail,
  sendPaymentSuccessEmail,
  sendLoginOtpEmail,
  sendPasswordResetOtpEmail,
  sendSubscriptionWarningEmail,
  sendSubscriptionExpiredEmail,
  sendRenewalEmail,
  sendQrReadyEmail
} from '../email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const recipient = 'xshankarmishra@gmail.com';
  console.log(`Sending ALL 6 Corporate Transactional Email Templates to ${recipient}...`);

  const client = {
    email: recipient,
    ownerName: 'Shankar Mishra',
    businessName: 'The Royal Heritage Lounge',
    plan: 'YEARLY PREMIUM',
    billingCycle: 'Yearly',
    monthlyPrice: '1499',
    password: 'MyshankarPass2026!',
  };

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  // 1. Welcome & Credentials Email
  console.log('Sending 1/6: Welcome & Credentials Email...');
  await sendClientWelcomeEmail(client);

  // 2. Login 2FA OTP Email
  console.log('Sending 2/6: Login 2FA OTP Email...');
  await sendLoginOtpEmail({ email: recipient, otp: '482915', ownerName: 'Shankar Mishra' });

  // 3. Password Reset OTP Email
  console.log('Sending 3/6: Password Reset OTP Email...');
  await sendPasswordResetOtpEmail({ email: recipient, otp: '937104', ownerName: 'Shankar Mishra' });

  // 4. Payment Receipt Email
  console.log('Sending 4/6: Payment Receipt Email...');
  await sendPaymentSuccessEmail({
    email: recipient,
    businessName: client.businessName,
    plan: client.plan,
    amount: 1499,
    expiresAt: nextYear.toISOString()
  });

  // 5. Subscription Warning Email
  console.log('Sending 5/6: Subscription Expiry Warning Email...');
  await sendSubscriptionWarningEmail({
    email: recipient,
    businessName: client.businessName,
    daysRemaining: 10,
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
  });

  // 6. Subscription Expired Email
  console.log('Sending 6/6: Subscription Expired Notice Email...');
  await sendSubscriptionExpiredEmail({
    email: recipient,
    businessName: client.businessName
  });

  console.log('All 6 Corporate Email Templates sent successfully to xshankarmishra@gmail.com!');
}

run().catch(console.error);
