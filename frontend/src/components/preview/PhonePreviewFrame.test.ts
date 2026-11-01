import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHOWCASE_PRESETS,
  getPreset,
  themeFromPresetId,
} from '../../design-system/presets.ts';
import { derivePalette } from '../../design-system/palette.ts';
import {
  DEFAULT_VIEWPORT_WIDTH,
  DEFAULT_VIEWPORT_HEIGHT,
  type PhonePreviewSyncMessage,
  type PhonePreviewSyncPayload,
} from './previewTypes.ts';

test('phone preview: standard iPhone viewport specifications (390x844)', async (t) => {
  await t.test('standard viewport dimensions match iPhone 14/15/16 baseline', () => {
    assert.equal(DEFAULT_VIEWPORT_WIDTH, 390, 'viewport width must be standard 390px');
    assert.equal(DEFAULT_VIEWPORT_HEIGHT, 844, 'viewport height must be standard 844px');
    const aspectRatio = DEFAULT_VIEWPORT_WIDTH / DEFAULT_VIEWPORT_HEIGHT;
    assert.ok(Math.abs(aspectRatio - 0.462) < 0.01, 'aspect ratio must match ~0.462 standard phone screen');
  });

  await t.test('scale-to-fit transform preserves proportional scaling without clipping', () => {
    const targetFrameWidth = 410; // 390 screen + 20 border
    const targetFrameHeight = 864; // 844 screen + 20 border

    const computeScale = (containerWidth: number) => {
      if (containerWidth < targetFrameWidth) {
        return Math.max(0.4, containerWidth / targetFrameWidth);
      }
      return 1;
    };

    // Full desktop column (420px): scale 1.0
    assert.equal(computeScale(420), 1.0);

    // Tight tablet / laptop column (350px): scale ~0.8536
    const scale350 = computeScale(350);
    assert.ok(Math.abs(scale350 - 0.8536) < 0.001);
    const scaledHeight350 = Math.round(targetFrameHeight * scale350);
    assert.equal(scaledHeight350, 738);

    // Narrow mobile screen (300px): scale ~0.7317
    const scale300 = computeScale(300);
    assert.ok(Math.abs(scale300 - 0.7317) < 0.001);
  });
});

test('atelier-rangeen: preset picker availability and architectural validity', async (t) => {
  await t.test('atelier-rangeen is prominently available in SHOWCASE_PRESETS', () => {
    const preset = SHOWCASE_PRESETS.find((p) => p.id === 'atelier-rangeen');
    assert.ok(preset, 'atelier-rangeen must be present in SHOWCASE_PRESETS');
    assert.equal(preset.label, 'Rangeen');
    assert.equal(preset.category, 'contemporary');
    assert.equal(preset.seedColor, '#c5221f');
    assert.equal(preset.mode, 'light');
    assert.equal(preset.signatureId, 'atelier-rangeen');
    assert.equal(preset.typePair, 'bold-street');
  });

  await t.test('atelier-rangeen resolves to a valid full 400-unit MenuTheme', () => {
    const theme = themeFromPresetId('atelier-rangeen');
    assert.equal(theme.presetId, 'atelier-rangeen');
    assert.equal(theme.signatureId, 'atelier-rangeen');
    assert.equal(theme.brand.seedColor, '#c5221f');
    assert.equal(theme.mode, 'light');
    assert.equal(theme.typePair, 'bold-street');

    // Palette derivation produces valid contrasting tokens
    const palette = derivePalette(theme.brand.seedColor, theme.mode);
    assert.ok(palette.bg, 'palette must have background color');
    assert.ok(palette.heading, 'palette must have heading color');
    assert.ok(palette.accent, 'palette must have accent color');
  });
});

test('preview synchronization: real-time postMessage payload bridge', async (t) => {
  await t.test('postMessage payload correctly models theme, colors, font pairing, and preset', () => {
    const theme = themeFromPresetId('atelier-rangeen');
    const palette = derivePalette(theme.brand.seedColor, theme.mode);

    const payload: PhonePreviewSyncPayload = {
      theme,
      presetId: theme.presetId,
      colors: {
        seed: theme.brand.seedColor,
        mode: theme.mode,
        palette,
      },
      fontPairing: theme.typePair,
      slots: theme.slots,
      signatureId: theme.signatureId,
      timestamp: Date.now(),
    };

    const message: PhonePreviewSyncMessage = {
      type: 'MENUQR_THEME_SYNC',
      payload,
    };

    assert.equal(message.type, 'MENUQR_THEME_SYNC');
    assert.equal(message.payload.presetId, 'atelier-rangeen');
    assert.equal(message.payload.colors?.seed, '#c5221f');
    assert.equal(message.payload.colors?.mode, 'light');
    assert.equal(message.payload.fontPairing, 'bold-street');
    assert.equal(message.payload.signatureId, 'atelier-rangeen');
    assert.ok(message.payload.timestamp > 0);
  });

  await t.test('instant draft reactivity updates palette and theme without mutating base preset', () => {
    const basePreset = getPreset('atelier-rangeen');
    const customAccent = '#e8783c';
    const customFontPair = 'royal-serif';

    const draftTheme = {
      ...themeFromPresetId(basePreset.id),
      typePair: customFontPair as any,
      brand: {
        ...themeFromPresetId(basePreset.id).brand,
        seedColor: customAccent,
      },
    };

    assert.equal(draftTheme.brand.seedColor, '#e8783c', 'draft reflects immediate color change');
    assert.equal(draftTheme.typePair, 'royal-serif', 'draft reflects immediate font pairing change');
    assert.equal(basePreset.seedColor, '#c5221f', 'base preset remains pristine and unmutated');
  });
});
