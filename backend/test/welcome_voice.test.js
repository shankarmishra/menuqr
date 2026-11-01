import test from 'node:test';
import assert from 'node:assert/strict';
import { publicAccentFrom } from '../publicMenuPayload.js';

test('publicAccentFrom preserves stored voice greeting for audio playback', () => {
  const accent = {
    colors: { bg: '#ffffff', text: '#111111' },
    voiceGreeting: {
      enabled: true,
      audioUrl: 'https://storage.googleapis.com/menuqr-bucket/audio/tenant1.mp3',
      text: 'Namaste! Welcome to our restaurant.',
      voiceGender: 'female',
    },
    internalSettings: { secret: 'private-data' },
  };

  const pub = publicAccentFrom(accent);
  assert.ok(pub);
  assert.equal(pub.colors.bg, '#ffffff');
  assert.equal(pub.colors.text, '#111111');
  assert.equal(pub.voiceGreeting.enabled, true);
  assert.equal(pub.voiceGreeting.audioUrl, 'https://storage.googleapis.com/menuqr-bucket/audio/tenant1.mp3');
  assert.equal(pub.voiceGreeting.text, 'Namaste! Welcome to our restaurant.');
  assert.equal(pub.voiceGreeting.voiceGender, 'female');
  // Internal/private settings are never leaked
  assert.equal(pub.internalSettings, undefined);
});

test('publicAccentFrom safely handles relative audio paths (/uploads/...)', () => {
  const accent = {
    voiceGreeting: {
      enabled: true,
      audioUrl: '/uploads/voice-123.wav',
    },
  };
  const pub = publicAccentFrom(accent);
  assert.ok(pub?.voiceGreeting);
  assert.equal(pub.voiceGreeting.audioUrl, '/uploads/voice-123.wav');
});

test('publicAccentFrom strips unsafe audio URLs', () => {
  const accent = {
    voiceGreeting: {
      enabled: true,
      audioUrl: 'javascript:alert(1)',
    },
  };
  const pub = publicAccentFrom(accent);
  assert.equal(pub, null);
});

test('publicAccentFrom omits voiceGreeting when disabled', () => {
  const accent = {
    colors: { bg: '#ffffff' },
    voiceGreeting: {
      enabled: false,
      audioUrl: 'https://storage.googleapis.com/menuqr-bucket/audio/tenant1.mp3',
    },
  };
  const pub = publicAccentFrom(accent);
  assert.ok(pub);
  assert.equal(pub.voiceGreeting, undefined);
  assert.equal(pub.colors.bg, '#ffffff');
});
