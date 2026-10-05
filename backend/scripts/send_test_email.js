import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendClientWelcomeEmail, sendPaymentSuccessEmail } from '../email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  console.log('Sending test email to xshankarmishra@gmail.com...');
  
  const testClient = {
    email: 'xshankarmishra@gmail.com',
    ownerName: 'Shankar Mishra',
    businessName: 'The Royal Heritage Cafe & Lounge',
    plan: 'YEARLY PREMIUM',
    billingCycle: 'Yearly',
    monthlyPrice: '1499',
  };

  await sendClientWelcomeEmail(testClient);
  await sendPaymentSuccessEmail({
    email: 'xshankarmishra@gmail.com',
    businessName: 'The Royal Heritage Cafe & Lounge',
    plan: 'YEARLY PREMIUM',
    amount: 1499,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  });

  console.log('Done sending emails!');
}

run().catch(console.error);
