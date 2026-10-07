import 'dotenv/config';
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: { rejectUnauthorized: false }
});
transporter.sendMail({
  from: process.env.SMTP_USER,
  to: 'menusqr.in@gmail.com',
  subject: 'Test',
  text: 'Test!'
}).then(() => console.log('Success')).catch(err => console.error(err));
