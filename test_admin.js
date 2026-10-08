import 'dotenv/config';
import { sendAdminLoginOtpEmail } from './backend/email.js';

async function test() {
  try {
    console.log('Sending admin email...');
    await sendAdminLoginOtpEmail({ email: 'xshankarmishra@gmail.com', otp: '123456' });
    console.log('Done.');
  } catch (err) {
    console.error('Failed:', err);
  }
}

test();
