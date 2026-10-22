import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAiMenuDesign, isGeminiAvailable } from '../aiDesignService.js';
import { validateDesignSpecification } from '../designSpecValidator.js';

test('Gemini Design Service - Availability & Configuration', () => {
  const available = isGeminiAvailable();
  assert.equal(typeof available, 'boolean');
});

test('Gemini Design Service - Generates Valid Specification for Fine-Dining Profile', async () => {
  const result = await generateAiMenuDesign({
    tenantId: 'tenant-test-fine-dining',
    profile: {
      businessName: 'The Regal Peacock',
      cuisine: 'Awadhi & Mughlai Royal Cuisine',
      positioning: 'fine-dining',
      mood: 'royal-heritage',
      hasPhotography: true,
      menuDensity: 'spacious',
      tagline: 'Centuries of Nawabi Gastronomy',
      brandColors: {
        primary: '#C5A059',
        accent: '#D4AF37',
        bg: '#14080E',
      },
    },
    brief: 'Create a rich royal Awadhi menu with gold accents, velvet dark tones, and imperial typography.',
  });

  assert.ok(result);
  assert.ok(result.spec);
  assert.equal(result.spec.version, '1.0');
  assert.ok(['editorial', 'image-showcase', 'compact-bistro'].includes(result.spec.composition));
  assert.ok(result.spec.colors.bg);
  assert.ok(result.spec.colors.heading);
  assert.ok(result.spec.colors.accent);
  assert.ok(result.spec.typography.headingFont);
  assert.ok(['gemini', 'deterministic-fallback'].includes(result.provider));
});

test('Gemini Design Service - Generates Valid Specification for Fast-Casual Bistro', async () => {
  const result = await generateAiMenuDesign({
    tenantId: 'tenant-test-fast-casual',
    profile: {
      businessName: 'Luigi Artisan Slices',
      cuisine: 'Neapolitan Wood-Fired Pizza',
      positioning: 'casual',
      mood: 'warm-bistro',
      hasPhotography: false,
      menuDensity: 'compact',
    },
    brief: 'High efficiency quick-scanning pizzeria menu with warm terracotta and espresso tones.',
  });

  assert.ok(result.spec);
  assert.ok(result.spec.colors.bg);
  assert.ok(result.spec.colors.text);
  assert.ok(result.spec.items.cardStyle);
  assert.ok(result.spec.items.priceStyle);
});

test('Gemini Design Service - Handles Multimodal Reference Image Input', async () => {
  const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const result = await generateAiMenuDesign({
    tenantId: 'tenant-test-multimodal',
    profile: {
      businessName: 'Botanical Garden Cafe',
      cuisine: 'Matcha & Artisanal Pastries',
      positioning: 'contemporary',
      mood: 'fresh-cafe',
      hasPhotography: true,
      menuDensity: 'balanced',
    },
    brief: 'Emulate the lush green aesthetic from this interior snapshot.',
    referenceImage: testBase64,
  });

  assert.ok(result.spec);
  assert.ok(result.spec.colors.accent);
  assert.ok(result.spec.colors.bg);
});

test('Gemini Design Service - Rejects Missing Tenant ID', async () => {
  await assert.rejects(
    async () => {
      await generateAiMenuDesign({
        tenantId: '',
        profile: { businessName: 'Test', cuisine: 'Test' },
      });
    },
    { message: /Tenant ID is required/ }
  );
});

test('Gemini Design Service - Enforces Tenant Rate Limit (Max 10 req/min)', async () => {
  const rateLimitTenant = 'tenant-rate-limit-stress-' + Date.now();
  const originalKey = process.env.GEMINI_API_KEY;

  try {
    // Disable external API key temporarily so requests complete instantaneously in 1-2ms
    delete process.env.GEMINI_API_KEY;

    // Issue 10 requests rapidly
    for (let i = 0; i < 10; i++) {
      const res = await generateAiMenuDesign({
        tenantId: rateLimitTenant,
        profile: { businessName: 'Stress Test', cuisine: 'Testing' },
      });
      assert.ok(res.spec);
    }

    // 11th request in the same window must fail with Rate Limit Exceeded
    await assert.rejects(
      async () => {
        await generateAiMenuDesign({
          tenantId: rateLimitTenant,
          profile: { businessName: 'Stress Test 11', cuisine: 'Testing' },
        });
      },
      { message: /Rate limit exceeded/ }
    );
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }
});

test('Design Spec Validator - Sanitizes Font Strings & Rejects Injections', () => {
  const badSpec = {
    version: '1.0',
    composition: 'editorial',
    colors: {
      bg: '#180912',
      surface: '#270F1E',
      text: '#FAF3E0',
      heading: '#E5C058',
      accent: '#D4AF37',
      border: 'rgba(212, 175, 55, 0.35)',
    },
    typography: {
      headingFont: '<script>alert(1)</script>',
      bodyFont: 'Plus Jakarta Sans, sans-serif',
    },
  };

  const validated = validateDesignSpecification(badSpec);
  assert.ok(validated);
  // Font containing malicious characters must fallback safely
  assert.equal(validated.typography.headingFont, "'Playfair Display', serif");
});

test('Design Spec Validator - Rejects Invalid Color Hex or Dangerous CSS', () => {
  const maliciousSpec = {
    version: '1.0',
    composition: 'editorial',
    colors: {
      bg: 'expression(alert(1))',
      surface: '#270F1E',
      text: '#FAF3E0',
      heading: '#E5C058',
      accent: '#D4AF37',
      border: 'rgba(212, 175, 55, 0.35)',
    },
  };

  const validated = validateDesignSpecification(maliciousSpec);
  assert.equal(validated, null);
});
