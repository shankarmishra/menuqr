import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendClientWelcomeEmail, sendMarketingCampaignEmail } from '../email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const recipient = 'xshankarmishra@gmail.com';
  console.log(`Sending Logo Branded Credentials & Marketing Ad Campaign emails to ${recipient}...`);

  // 1. Transactional Welcome Credentials Email with High-Res Logo Header
  await sendClientWelcomeEmail({
    email: recipient,
    ownerName: 'Shankar Mishra',
    businessName: 'The Royal Heritage Lounge',
    plan: 'YEARLY PREMIUM',
    billingCycle: 'Yearly',
    monthlyPrice: '1499',
    password: 'MyshankarPass2026!',
  });

  // 2. High-Converting Marketing Ad Campaign Email
  await sendMarketingCampaignEmail({
    email: recipient,
    restaurantName: 'The Royal Heritage Lounge',
    ownerName: 'Shankar Mishra',
    offerPrice: '1499',
  });

  console.log('Both emails sent successfully to xshankarmishra@gmail.com!');
}

run().catch(console.error);
