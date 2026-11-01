import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  normalizeInstagram,
  normalizeFacebook,
  normalizeWebsite,
  normalizePhones,
  normalizeSlug,
  normalizeImageUrl,
} from '../validation.js';

const fixtures = JSON.parse(
  fs.readFileSync(new URL('./fixtures/profile-rules.json', import.meta.url), 'utf8')
);

test('normalizeInstagram matches profile-rules fixtures', async (t) => {
  for (const fixture of fixtures.instagram) {
    await t.test(JSON.stringify(fixture.input), () => {
      const result = normalizeInstagram(fixture.input);
      assert.equal(result, fixture.error ? null : fixture.value ?? null);
    });
  }
});

test('normalizeFacebook matches profile-rules fixtures', async (t) => {
  for (const fixture of fixtures.facebook) {
    await t.test(JSON.stringify(fixture.input), () => {
      const result = normalizeFacebook(fixture.input);
      assert.equal(result, fixture.error ? null : fixture.value ?? null);
    });
  }
});

test('normalizeWebsite matches profile-rules fixtures', async (t) => {
  for (const fixture of fixtures.website) {
    await t.test(JSON.stringify(fixture.input), () => {
      const result = normalizeWebsite(fixture.input);
      assert.equal(result, fixture.error ? null : fixture.value ?? null);
    });
  }
});

test('normalizePhones matches profile-rules fixtures', async (t) => {
  for (const fixture of fixtures.phones) {
    await t.test(JSON.stringify(fixture.input), () => {
      const result = normalizePhones(fixture.input);
      assert.equal(result, fixture.error ? null : fixture.value ?? null);
    });
  }
});

test('normalizeSlug matches profile-rules fixtures', async (t) => {
  for (const fixture of fixtures.slug) {
    await t.test(JSON.stringify(fixture.input), () => {
      const result = normalizeSlug(fixture.input);
      assert.equal(result, fixture.error ? null : fixture.value ?? null);
    });
  }
});

test('normalizeImageUrl matches profile-rules fixtures', async (t) => {
  for (const fixture of fixtures.imageUrl) {
    await t.test(JSON.stringify(fixture.input), () => {
      const result = normalizeImageUrl(fixture.input);
      assert.equal(result, fixture.error ? null : fixture.value ?? null);
    });
  }
});
