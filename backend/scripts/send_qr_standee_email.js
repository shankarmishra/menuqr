import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendQrReadyEmail } from '../email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const recipient = 'xshankarmishra@gmail.com';
  console.log(`Sending Physical QR Placard Standee Email to ${recipient}...`);

  await sendQrReadyEmail({
    email: recipient,
    businessName: 'GreenBite RESTAURANT & CAFE',
    tagline: 'Good Food | Happy Mood',
    menuSlug: 'greenbite-cafe',
  });

  console.log('Physical QR Placard Standee Email sent successfully to xshankarmishra@gmail.com!');
}

run().catch(console.error);
