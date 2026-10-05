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
  sendQrReadyEmail,
  sendMarketingCampaignEmail
} from '../email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const recipient = 'prakashmishra262005@gmail.com';
  console.log(`Sending ALL 9 Email Templates to ${recipient} one by one...`);

  const client = {
    email: recipient,
    ownerName: 'Prakash Mishra',
    businessName: 'GreenBite RESTAURANT & CAFE',
    tagline: 'Good Food | Happy Mood',
    menuSlug: 'greenbite-cafe',
    plan: 'YEARLY PREMIUM',
    billingCycle: 'Yearly',
    monthlyPrice: '1499',
    password: 'PrakashPass2026!',
  };

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  // 1. Welcome & Login Credentials Email
  console.log('Sending 1/9: Welcome & Login Credentials Email...');
  await sendClientWelcomeEmail(client);
  await delay(1500);

  // 2. 2-Step Login OTP Verification Email
  console.log('Sending 2/9: 2-Step Login OTP Verification Email...');
  await sendLoginOtpEmail({ email: recipient, otp: '482915', ownerName: 'Prakash Mishra' });
  await delay(1500);

  // 3. Password Reset OTP Email
  console.log('Sending 3/9: Password Reset OTP Email...');
  await sendPasswordResetOtpEmail({ email: recipient, otp: '937104', ownerName: 'Prakash Mishra' });
  await delay(1500);

  // 4. Payment Receipt Invoice Email
  console.log('Sending 4/9: Payment Receipt Invoice Email...');
  await sendPaymentSuccessEmail({
    email: recipient,
    businessName: client.businessName,
    plan: client.plan,
    amount: 1499,
    expiresAt: nextYear.toISOString()
  });
  await delay(1500);

  // 5. Subscription Expiry Warning Email (10 Days)
  console.log('Sending 5/9: Subscription Expiry Warning Email...');
  await sendSubscriptionWarningEmail({
    email: recipient,
    businessName: client.businessName,
    daysRemaining: 10,
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
  });
  await delay(1500);

  // 6. Subscription Expired / QR Blocked Email
  console.log('Sending 6/9: Subscription Expired Notice Email...');
  await sendSubscriptionExpiredEmail({
    email: recipient,
    businessName: client.businessName
  });
  await delay(1500);

  // 7. Subscription Renewed Email
  console.log('Sending 7/9: Subscription Renewed Confirmation Email...');
  await sendRenewalEmail({
    email: recipient,
    businessName: client.businessName,
    expiresAt: nextYear.toISOString()
  });
  await delay(1500);

  // 8. Physical Table Standee Artwork & QR Download Email (Matching Gold/Emerald Standee Image)
  console.log('Sending 8/9: Physical Table Standee Artwork & QR Download Email...');
  await sendQrReadyEmail({
    email: recipient,
    businessName: client.businessName,
    tagline: client.tagline,
    menuSlug: client.menuSlug
  });
  await delay(1500);

  // 9. Marketing / Ad Campaign Sales Email
  console.log('Sending 9/9: Marketing / Ad Campaign Sales Email...');
  await sendMarketingCampaignEmail({
    email: recipient,
    restaurantName: client.businessName,
    ownerName: client.ownerName,
    offerPrice: '1499'
  });

  console.log(`SUCCESS! All 9 Email Templates sent to ${recipient}!`);
}

run().catch(console.error);
