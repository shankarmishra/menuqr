import test from 'node:test';
import assert from 'node:assert/strict';

function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length >= 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return null;
}

function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

class DeterministicDesignEngine {
  name = 'Deterministic Expert Rules Engine';
  isAIAvailable() { return false; }

  generateDesign(profile) {
    let composition;
    if (profile.positioning === 'fine-dining' || profile.mood === 'royal-heritage' || profile.mood === 'midnight-luxury') {
      composition = 'editorial';
    } else if (profile.hasPhotography || profile.mood === 'fresh-cafe') {
      composition = 'image-showcase';
    } else {
      composition = 'compact-bistro';
    }

    let bg = '#160814';
    let surface = '#240F21';
    let text = '#FDF8F0';
    let heading = '#E8C564';
    let accent = '#D4AF37';

    if (profile.mood === 'royal-heritage') {
      bg = '#180912';
      surface = '#270F1E';
      text = '#FAF3E0';
      heading = '#E5C058';
      accent = '#D4AF37';
    } else if (profile.mood === 'clean-editorial') {
      bg = '#F9F7F2';
      surface = '#FFFFFF';
      text = '#1F2923';
      heading = '#163328';
      accent = '#C4703C';
    }

    if (profile.brandColors?.bg) {
      bg = profile.brandColors.bg;
      const lum = getLuminance(bg);
      if (lum > 0.6) {
        text = '#0F172A';
        surface = '#FFFFFF';
      } else {
        text = '#F8FAFC';
        surface = 'rgba(255, 255, 255, 0.05)';
      }
    }

    let headingFont = "'Playfair Display', serif";
    if (composition === 'editorial') {
      headingFont = profile.mood === 'royal-heritage' ? "'Cinzel', serif" : "'Playfair Display', serif";
    } else if (composition === 'image-showcase') {
      headingFont = "'Montserrat', sans-serif";
    } else {
      headingFont = "'Oswald', sans-serif";
    }

    return {
      version: '1.0',
      composition,
      colors: { bg, surface, text, heading, accent },
      typography: { headingFont },
    };
  }
}

test('Deterministic Design Engine Suite', async (t) => {
  const engine = new DeterministicDesignEngine();

  await t.test('engine explicitly states no AI runtime API is assumed', () => {
    assert.equal(engine.isAIAvailable(), false);
    assert.equal(engine.name, 'Deterministic Expert Rules Engine');
  });

  await t.test('maps royal fine dining profile to editorial composition with Cinzel serif', () => {
    const spec = engine.generateDesign({
      businessName: 'The Imperial Pavilion',
      cuisine: 'Awadhi & Mughlai',
      positioning: 'fine-dining',
      mood: 'royal-heritage',
      hasPhotography: false,
    });
    assert.equal(spec.composition, 'editorial');
    assert.equal(spec.typography.headingFont, "'Cinzel', serif");
    assert.equal(spec.colors.bg, '#180912');
  });

  await t.test('maps photography-first cafe to image-showcase composition', () => {
    const spec = engine.generateDesign({
      businessName: 'Artisan Bakery',
      cuisine: 'French Pastry',
      positioning: 'contemporary',
      mood: 'fresh-cafe',
      hasPhotography: true,
    });
    assert.equal(spec.composition, 'image-showcase');
    assert.equal(spec.typography.headingFont, "'Montserrat', sans-serif");
  });

  await t.test('maps high density casual to compact-bistro composition', () => {
    const spec = engine.generateDesign({
      businessName: 'Urban Slice Pizza',
      cuisine: 'Fast Casual',
      positioning: 'casual',
      mood: 'urban-street',
      hasPhotography: false,
    });
    assert.equal(spec.composition, 'compact-bistro');
    assert.equal(spec.typography.headingFont, "'Oswald', sans-serif");
  });

  await t.test('dynamically adapts text contrast for custom light and dark brand backgrounds', () => {
    // Light background (#FAF8F5)
    const lightSpec = engine.generateDesign({
      businessName: 'White Lotus',
      positioning: 'contemporary',
      mood: 'clean-editorial',
      hasPhotography: true,
      brandColors: { bg: '#FAF8F5' },
    });
    assert.equal(lightSpec.colors.text, '#0F172A', 'Light background must have dark text');

    // Dark background (#0A0C0E)
    const darkSpec = engine.generateDesign({
      businessName: 'Obsidian Bar',
      positioning: 'contemporary',
      mood: 'midnight-luxury',
      hasPhotography: true,
      brandColors: { bg: '#0A0C0E' },
    });
    assert.equal(darkSpec.colors.text, '#F8FAFC', 'Dark background must have light text');
  });
});
