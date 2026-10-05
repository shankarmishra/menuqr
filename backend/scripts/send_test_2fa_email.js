import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendClientWelcomeEmail, sendLoginOtpEmail, sendPasswordResetOtpEmail } from '../email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  console.log('Sending enhanced credentials welcome & 2FA OTP emails to xshankarmishra@gmail.com...');
  
  const testClient = {
    email: 'xshankarmishra@gmail.com',
    ownerName: 'Shankar Mishra',
    businessName: 'The Royal Heritage Cafe & Lounge',
    plan: 'YEARLY PREMIUM',
    billingCycle: 'Yearly',
    monthlyPrice: '1499',
    password: 'MyshankarPass2026!',
  };

  // 1. Welcome Email with Login ID & Password
  await sendClientWelcomeEmail(testClient);

  // 2. 2-Step Verification Login OTP Email
  await sendLoginOtpEmail({
    email: 'xshankarmishra@gmail.com',
    otp: '482915',
    ownerName: 'Shankar Mishra',
  });

  // 3. Password Reset OTP Email
  await sendPasswordResetOtpEmail({
    email: 'xshankarmishra@gmail.com',
    otp: '937104',
    ownerName: 'Shankar Mishra',
  });

  console.log('All 3 test emails sent successfully!');
}

run().catch(console.error);
