import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { sendClientWelcomeEmail } from '../email.js';

loadEnv({ path: path.resolve('.env') });

async function testEmailSending() {
  console.log('Testing email dispatch using configured SMTP credentials...');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('SMTP User:', process.env.SMTP_USER);

  await sendClientWelcomeEmail({
    ownerName: 'Prakash',
    businessName: 'The Royal Grand Cafe',
    email: 'menusqr.in@gmail.com',
    plan: 'PREMIUM',
    billingCycle: 'Monthly',
    monthlyPrice: '1499'
  });

  console.log('Email dispatch test finished.');
}

testEmailSending().catch(console.error);
