import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { validateAndPreviewImport, detectColumnMappings } from '../menuImporter.js';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const API_BASE = 'https://api.menusqr.in';
const EMAIL = 'sr.shobharams@gmail.com';
const EXCEL_PATH = 'C:/Users/xshan/Downloads/Updated Menu-data.xlsx';
const TOKEN_CACHE_FILE = path.join(process.cwd(), 'temp_otp_session.json');

async function main() {
  const otpArg = process.argv[2]?.trim();

  if (!otpArg) {
    console.log(`[1/3] Requesting Login OTP for ${EMAIL}...`);
    const res = await fetch(`${API_BASE}/api/auth/request-login-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Failed to request OTP:', data);
      process.exit(1);
    }

    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify({
      tempToken: data.tempToken,
      email: EMAIL,
      timestamp: Date.now()
    }, null, 2));

    console.log(`\nOTP sent to ${EMAIL}!`);
    console.log(`Saved session tempToken: ${data.tempToken}`);
    console.log(`\nTo execute upload, run:\nnode backend/scripts/upload-menu-for-client.js <6_DIGIT_OTP>\n`);
    return;
  }

  // If OTP is provided, verify and execute import
  console.log(`[2/3] Verifying OTP ${otpArg} for ${EMAIL}...`);
  if (!fs.existsSync(TOKEN_CACHE_FILE)) {
    console.error('No pending OTP request found. Run without arguments first.');
    process.exit(1);
  }

  const { tempToken } = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf-8'));

  const verifyRes = await fetch(`${API_BASE}/api/auth/verify-login-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempToken, otp: otpArg })
  });

  const verifyData = await verifyRes.json();
  if (!verifyRes.ok) {
    console.error('OTP verification failed:', verifyData);
    process.exit(1);
  }

  console.log('Login verified successfully!');
  console.log('User Role:', verifyData.role);
  console.log('Tenant ID:', verifyData.user?.tenantId);

  const token = verifyData.token;
  const csrfToken = verifyData.csrfToken;

  // Read cookies from Set-Cookie header if present
  const setCookieHeader = verifyRes.headers.get('set-cookie') || '';
  const cookieHeader = `menusqr_auth=${token}`;

  // Step 3: Parse Excel and execute replace import
  console.log(`[3/3] Parsing Excel file: ${EXCEL_PATH}...`);
  const wb = XLSX.readFile(EXCEL_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headers = json[0];
  const rowObjects = [];
  for (let i = 1; i < json.length; i++) {
    const row = json[i];
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = row[idx]; });
    rowObjects.push(obj);
  }

  const columnMap = detectColumnMappings(headers);
  const preview = validateAndPreviewImport(rowObjects, columnMap, []);
  console.log(`Parsed: ${preview.summary.itemsCount} items across ${preview.summary.categoriesCount} categories.`);

  console.log(`Calling /api/app/menu/import/execute with mode='replace'...`);
  const importRes = await fetch(`${API_BASE}/api/app/menu/import/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cookie': cookieHeader,
      'x-csrf-token': csrfToken || ''
    },
    body: JSON.stringify({
      categories: preview.categories,
      mode: 'replace',
      filename: 'Updated Menu-data.xlsx'
    })
  });

  const importData = await importRes.json();
  if (!importRes.ok) {
    console.error('Import execution failed:', importData);
    process.exit(1);
  }

  console.log('\n===========================================');
  console.log('SUCCESS! Old menu wiped and updated cleanly:');
  console.log('Import Stats:', importData);
  console.log('===========================================\n');

  // Clean up temp token file
  fs.unlinkSync(TOKEN_CACHE_FILE);
}

main().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
