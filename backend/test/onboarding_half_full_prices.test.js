import test from 'node:test';
import assert from 'node:assert/strict';

test('Onboarding Half/Full Pricing Normalization & Fallback Logic', async (t) => {
  await t.test('1. Normalizes items with halfPrice and fullPrice correctly', () => {
    const rawItems = [
      { categoryIndex: 0, name: 'Paneer Tikka', price: 0, halfPrice: 140, fullPrice: 240, dietType: 'veg' },
      { categoryIndex: 0, name: 'Chicken Tikka', price: 280, halfPrice: null, fullPrice: null, dietType: 'non-veg' },
      { categoryIndex: 0, name: 'Special Platter', price: '', halfPrice: '190', fullPrice: '350', dietType: 'veg' },
    ];

    const normalized = rawItems.map((item) => {
      const halfPrice = item?.halfPrice != null && item?.halfPrice !== '' && Number.isFinite(Number(item.halfPrice)) ? Number(item.halfPrice) : null;
      const fullPrice = item?.fullPrice != null && item?.fullPrice !== '' && Number.isFinite(Number(item.fullPrice)) ? Number(item.fullPrice) : null;
      let price = Number(item?.price);
      if (!Number.isFinite(price) || price <= 0) {
        price = fullPrice || halfPrice || 0;
      }
      return {
        name: item.name,
        price,
        halfPrice,
        fullPrice,
        dietType: item.dietType,
      };
    });

    // Paneer Tikka: price fallback to fullPrice (240)
    assert.equal(normalized[0].price, 240);
    assert.equal(normalized[0].halfPrice, 140);
    assert.equal(normalized[0].fullPrice, 240);

    // Chicken Tikka: single price preserved
    assert.equal(normalized[1].price, 280);
    assert.equal(normalized[1].halfPrice, null);
    assert.equal(normalized[1].fullPrice, null);

    // Special Platter: string numbers parsed and price fallback to fullPrice (350)
    assert.equal(normalized[2].price, 350);
    assert.equal(normalized[2].halfPrice, 190);
    assert.equal(normalized[2].fullPrice, 350);
  });

  await t.test('2. Fallback to halfPrice if only halfPrice is provided', () => {
    const item = { categoryIndex: 0, name: 'Soup Bowl', price: '', halfPrice: 90, fullPrice: null };
    const halfPrice = item?.halfPrice != null && item?.halfPrice !== '' && Number.isFinite(Number(item.halfPrice)) ? Number(item.halfPrice) : null;
    const fullPrice = item?.fullPrice != null && item?.fullPrice !== '' && Number.isFinite(Number(item.fullPrice)) ? Number(item.fullPrice) : null;
    let price = Number(item?.price);
    if (!Number.isFinite(price) || price <= 0) {
      price = fullPrice || halfPrice || 0;
    }

    assert.equal(price, 90);
    assert.equal(halfPrice, 90);
    assert.equal(fullPrice, null);
  });
});
