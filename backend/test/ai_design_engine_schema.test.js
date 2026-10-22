import test from 'node:test';
import assert from 'node:assert/strict';

// Test runtime validation logic directly
const SAFE_COLOR_REGEX = /^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\([^)]+\)|transparent)$/;

function isValidColor(val) {
  if (typeof val !== 'string') return false;
  return SAFE_COLOR_REGEX.test(val.trim());
}

function validateDesignSpecification(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw;
  if (data.version !== '1.0') return null;

  const validCompositions = ['editorial', 'image-showcase', 'compact-bistro'];
  if (!data.composition || !validCompositions.includes(data.composition)) {
    return null;
  }

  if (!data.colors || typeof data.colors !== 'object') return null;
  const c = data.colors;
  if (
    !isValidColor(c.bg) ||
    !isValidColor(c.surface) ||
    !isValidColor(c.text) ||
    !isValidColor(c.heading) ||
    !isValidColor(c.accent) ||
    !isValidColor(c.border)
  ) {
    return null;
  }

  return {
    version: '1.0',
    composition: data.composition,
    themeId: typeof data.themeId === 'string' ? data.themeId : undefined,
    colors: {
      bg: c.bg,
      surface: c.surface,
      surfaceAlt: isValidColor(c.surfaceAlt) ? c.surfaceAlt : c.surface,
      text: c.text,
      textMuted: isValidColor(c.textMuted) ? c.textMuted : c.text,
      heading: c.heading,
      accent: c.accent,
      border: c.border,
      badgeBg: isValidColor(c.badgeBg) ? c.badgeBg : c.accent,
      badgeText: isValidColor(c.badgeText) ? c.badgeText : '#FFFFFF',
    },
    typography: {
      headingFont: typeof data.typography?.headingFont === 'string' ? data.typography.headingFont : "'Playfair Display', serif",
      bodyFont: typeof data.typography?.bodyFont === 'string' ? data.typography.bodyFont : "'Plus Jakarta Sans', sans-serif",
      style: data.typography?.style || 'serif',
      headingWeight: data.typography?.headingWeight || 'bold',
    },
    header: {
      style: data.header?.style || 'centered-crest',
      showLogo: Boolean(data.header?.showLogo ?? true),
      decorativeElement: data.header?.decorativeElement || 'crest',
      crestType: data.header?.crestType || 'none',
    },
    categories: {
      navStyle: data.categories?.navStyle || 'pills',
      headerStyle: data.categories?.headerStyle || 'divider-line',
    },
    items: {
      cardStyle: data.items?.cardStyle || (data.composition === 'image-showcase' ? 'photo-hero' : data.composition === 'compact-bistro' ? 'compact-row' : 'classic-leader'),
      imagePosition: data.items?.imagePosition || (data.composition === 'image-showcase' ? 'top' : 'right'),
      priceStyle: data.items?.priceStyle || 'aligned-right',
    },
    decorations: {
      texture: data.decorations?.texture || 'clean',
      borderRadius: data.decorations?.borderRadius || 'md',
      borderStyle: data.decorations?.borderStyle || 'hairline',
      shadow: data.decorations?.shadow || 'subtle',
    },
  };
}

test('Design Specification Validation Suite', async (t) => {
  await t.test('accepts valid editorial design specification', () => {
    const validSpec = {
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
    };

    const validated = validateDesignSpecification(validSpec);
    assert.ok(validated);
    assert.equal(validated.composition, 'editorial');
    assert.equal(validated.colors.heading, '#E5C058');
    assert.equal(validated.typography.style, 'serif');
    assert.equal(validated.decorations.texture, 'clean');
  });

  await t.test('accepts valid image-showcase and compact-bistro compositions', () => {
    for (const comp of ['image-showcase', 'compact-bistro']) {
      const spec = {
        version: '1.0',
        composition: comp,
        colors: {
          bg: '#FFFFFF',
          surface: '#F8F9FA',
          text: '#111827',
          heading: '#000000',
          accent: '#2563EB',
          border: 'rgba(0, 0, 0, 0.1)',
        },
      };
      const validated = validateDesignSpecification(spec);
      assert.ok(validated);
      assert.equal(validated.composition, comp);
    }
  });

  await t.test('rejects missing or invalid composition string', () => {
    const invalidComp = {
      version: '1.0',
      composition: 'unsupported-floating-3d',
      colors: {
        bg: '#000',
        surface: '#111',
        text: '#fff',
        heading: '#fff',
        accent: '#f00',
        border: '#222',
      },
    };
    assert.equal(validateDesignSpecification(invalidComp), null);
    assert.equal(validateDesignSpecification({ version: '1.0' }), null);
    assert.equal(validateDesignSpecification(null), null);
    assert.equal(validateDesignSpecification('string-not-object'), null);
  });

  await t.test('rejects malicious or invalid CSS colors to prevent XSS/injection', () => {
    const maliciousColors = [
      'javascript:alert(1)',
      '<script>evil()</script>',
      'expression(alert(1))',
      'url("http://malicious.site/tracker")',
      'linear-gradient(evil)',
      '#xyz123',
    ];

    for (const badColor of maliciousColors) {
      const spec = {
        version: '1.0',
        composition: 'editorial',
        colors: {
          bg: badColor,
          surface: '#270F1E',
          text: '#FAF3E0',
          heading: '#E5C058',
          accent: '#D4AF37',
          border: '#333333',
        },
      };
      assert.equal(validateDesignSpecification(spec), null, `Should have rejected bad color: ${badColor}`);
    }
  });

  await t.test('enforces strict defaults for missing optional sub-properties', () => {
    const minimalSpec = {
      version: '1.0',
      composition: 'image-showcase',
      colors: {
        bg: '#0A0E17',
        surface: '#121824',
        text: '#F3F4F6',
        heading: '#FFFFFF',
        accent: '#10B981',
        border: 'rgba(16, 185, 129, 0.2)',
      },
    };

    const sanitized = validateDesignSpecification(minimalSpec);
    assert.ok(sanitized);
    assert.equal(sanitized.items.cardStyle, 'photo-hero');
    assert.equal(sanitized.items.imagePosition, 'top');
    assert.equal(sanitized.decorations.borderRadius, 'md');
    assert.equal(sanitized.header.showLogo, true);
  });
});
