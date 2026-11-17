import test from 'node:test';
import assert from 'node:assert/strict';
import { toTokenDetail } from './tokenDetail.ts';

const RESPONSE = {
  success: true,
  token: {
    id: 'tok-1',
    tokenNumber: 104,
    tableNumber: 7,
    status: 'dining',
    createdAt: '2026-11-17T10:00:00Z',
    subtotalPaise: 100050,
    taxPaise: 18010,
    cgstPaise: 9005,
    sgstPaise: 9005,
    discountPaise: 0,
    totalPaise: 118060,
    total: 1181,
    taxMode: 'REGULAR',
    taxRateBps: 1800,
    restaurantName: 'Dhaba 7',
    restaurantGstin: '27AAPFU0939F1ZV',
    restaurantFssai: '10019022008765',
    items: [
      { dishName: 'Paneer Tikka', quantity: 2, totalPricePaise: 60050, isVeg: true, variant: 'Full' },
      { dishName: 'Chicken Curry', quantity: 1, totalPricePaise: 40000, isVeg: false },
    ],
  },
};

test('reads the token inside { token } and converts paise to rupees exactly', () => {
  const d = toTokenDetail(RESPONSE);
  assert.ok(d);
  assert.equal(d.restaurantName, 'Dhaba 7');
  assert.equal(d.restaurantGstin, '27AAPFU0939F1ZV');
  assert.equal(d.subtotal, 1000.5);
  assert.equal(d.gst, 180.1);
  assert.equal(d.cgst, 90.05);
  assert.equal(d.total, 1180.6, 'exact paise, not the rupee-rounded total');
  assert.equal(d.status, 'DINING');
  assert.equal(d.itemCount, 3);
  assert.deepEqual(d.items[0], { name: 'Paneer Tikka', variant: 'Full', quantity: 2, totalPrice: 600.5, isVeg: true });
  assert.equal(d.items[1].isVeg, false);
  assert.equal(d.taxRateBps, 1800);
});

test('missing or malformed responses give null', () => {
  assert.equal(toTokenDetail(null), null);
  assert.equal(toTokenDetail({ success: false }), null);
});
