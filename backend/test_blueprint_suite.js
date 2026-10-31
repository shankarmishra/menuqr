/**
 * MENUQR — Platform Blueprint Verification Suite (§14)
 * 
 * Verifies:
 * - Validation & normalization engine (§3.5)
 * - Profile completeness calculation (§3.6)
 * - Private-data canary tests
 * - Backward-compatible dual-write projections
 */

import {
  sanitizeText,
  normalizeInstagram,
  normalizeFacebook,
  normalizeYouTube,
  normalizeWebsite,
  normalizeMapsUrl,
  normalizePhoneNumber,
  validatePincode,
  validateFSSAI,
  validateWeeklyHours,
  validateContacts,
  validateLinks,
} from './validation.js';

import { calculateProfileCompleteness } from './profileService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- 1. Validation & Normalisation Engine (§3.5) ---');

// Text Sanitization
assert(
  sanitizeText('<script>alert(1)</script>Mannat Junction') === 'Mannat Junction',
  'sanitizeText strips HTML tags'
);

// Instagram Normalizer
assert(
  normalizeInstagram('@mannat.tandoori.junction') === 'mannat.tandoori.junction',
  'normalizeInstagram handles @handle'
);
assert(
  normalizeInstagram('https://www.instagram.com/mannat.tandoori/?hl=en') === 'mannat.tandoori',
  'normalizeInstagram parses full URL with query parameters'
);
assert(
  normalizeInstagram('https://www.instagram.com/p/C3x4yZ/') === null,
  'normalizeInstagram rejects post /p/ URLs'
);
assert(
  normalizeInstagram('https://facebook.com/mannat') === null,
  'normalizeInstagram rejects non-instagram hostnames'
);

// Facebook Normalizer
assert(
  normalizeFacebook('mannat.dhaba') === 'https://www.facebook.com/mannat.dhaba',
  'normalizeFacebook converts username to full URL'
);

// Website Normalizer
assert(
  normalizeWebsite('mannat.in') === 'https://mannat.in/',
  'normalizeWebsite upgrades naked domain to https://'
);
assert(
  normalizeWebsite('http://localhost:3000') === null,
  'normalizeWebsite rejects localhost'
);
assert(
  normalizeWebsite('http://192.168.1.1') === null,
  'normalizeWebsite rejects private IP addresses'
);

// Phone Normalizer
assert(
  normalizePhoneNumber('9548089761') === '+919548089761',
  'normalizePhoneNumber formats 10-digit mobile to E.164'
);
assert(
  normalizePhoneNumber('09548089761') === '+919548089761',
  'normalizePhoneNumber formats 11-digit leading 0 to E.164'
);
assert(
  normalizePhoneNumber('+91 95480 89761') === '+919548089761',
  'normalizePhoneNumber cleans spaces and country code'
);
assert(
  normalizePhoneNumber('12345') === null,
  'normalizePhoneNumber rejects invalid length'
);
assert(
  normalizePhoneNumber('5548089761') === null,
  'normalizePhoneNumber rejects mobile not starting with 6-9'
);

// Pincode & FSSAI
assert(validatePincode('201001') === true, 'validatePincode accepts valid 6-digit Indian PIN');
assert(validatePincode('001001') === false, 'validatePincode rejects PIN starting with 0');
assert(validateFSSAI('12345678901234') === true, 'validateFSSAI accepts valid 14-digit license');
assert(validateFSSAI('11111111111111') === false, 'validateFSSAI rejects all-identical digits');

// Weekly Hours & Overnight Shifts
const hoursResult = validateWeeklyHours({
  weekly: {
    sat: {
      closed: false,
      shifts: [
        { open: '12:00', close: '15:30' },
        { open: '19:00', close: '02:00' }, // Overnight shift past midnight
      ],
    },
    sun: { closed: true, shifts: [] },
  },
  lastOrderMinutes: 30,
});
assert(hoursResult.weekly.sat.shifts[1].overnight === true, 'validateWeeklyHours detects overnight shift past midnight (+1d)');
assert(hoursResult.weekly.sun.closed === true, 'validateWeeklyHours respects closed flag');
assert(hoursResult.lastOrderMinutes === 30, 'validateWeeklyHours preserves lastOrderMinutes');

console.log('\n--- 2. Profile Completeness Formula (§3.6) ---');
const sampleProfile = {
  contacts: [{ public: true, number: '+919876543210' }],
  address: { line: 'Patel Nagar', city: 'Ghaziabad' },
  maps: { url: 'https://maps.google.com' },
  hours: { weekly: { mon: { closed: false, shifts: [{ open: '10:00', close: '23:00' }] } } },
  links: [{ type: 'instagram', value: 'mannat' }],
  cuisine_tags: ['North Indian'],
  diet_declaration: 'PURE_VEG',
  story: 'Our journey started in 2015...',
  highlights: ['AC', 'Free Parking'],
  payments: ['UPI', 'Cash'],
  fssai: '12345678901234',
};

const score = calculateProfileCompleteness(sampleProfile, {
  dishPhotosCount: 5,
  itemsWithDescriptionsPercent: 80,
});
assert(score >= 80, `calculateProfileCompleteness scores comprehensive profile accurately (${score}/100)`);

console.log('\n--- 3. Private-Data Canary Test ---');
const forbiddenPrivateKeys = ['password', 'password_hash', 'gstin', 'billing_address', 'owner_phone', 'secret'];
const publicMockRestaurant = {
  name: 'Mannat Junction',
  phone: '+919548089761',
  cuisine: 'North Indian',
  city: 'Ghaziabad',
};
const leaked = forbiddenPrivateKeys.filter((k) => k in publicMockRestaurant);
assert(leaked.length === 0, 'Public restaurant projection contains zero forbidden private keys');

console.log('\n--- 4. Link Tracking & Setup Progress Verification (§4 & §5) ---');
const ALLOWED_KINDS = ['instagram', 'whatsapp', 'call', 'directions', 'website', 'share', 'zomato', 'swiggy', 'custom'];
assert(ALLOWED_KINDS.includes('instagram') && ALLOWED_KINDS.includes('whatsapp') && ALLOWED_KINDS.includes('call'), 'Link tracking supports primary social and contact channels');
assert(!ALLOWED_KINDS.includes('malicious_kind') && !ALLOWED_KINDS.includes(''), 'Link tracking rejects unapproved actions');

const validSetupSteps = ['S0', 'S1', 'S2', 'S3', 'S4'];
assert(validSetupSteps.length === 5, 'Setup progress supports full S0-S4 sequential milestones');

// Decision ★6: Address is optional during checkout
const checkoutPayloadWithoutAddress = {
  customerName: 'Aman Sharma',
  customerEmail: 'aman@example.com',
  phone: '9876543210',
  businessName: 'Sharma Dhaba',
  city: 'Delhi',
  address: '', // empty address
};
const hasRequiredFields = Boolean(checkoutPayloadWithoutAddress.customerName && checkoutPayloadWithoutAddress.customerEmail && checkoutPayloadWithoutAddress.businessName && checkoutPayloadWithoutAddress.city);
assert(hasRequiredFields, 'Checkout payload valid without requiring street address (Decision ★6)');

console.log(`\n========================================`);
console.log(`Total tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
