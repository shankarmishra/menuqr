import test from 'node:test';
import assert from 'node:assert/strict';
import { synthesizeVoiceGreeting } from '../welcomeVoice.js';

test('synthesizeVoiceGreeting produces audio wav buffer', async (t) => {
  if (!process.env.GEMINI_API_KEY) {
    t.skip('GEMINI_API_KEY not provided');
    return;
  }

  const result = await synthesizeVoiceGreeting({
    businessName: 'Test Cafe',
    messageStyle: 'hinglish_warm',
    voiceGender: 'female',
  });

  assert.ok(result.audioBuffer instanceof Buffer, 'Should return Buffer');
  assert.ok(result.audioBuffer.length > 10000, 'Audio should be substantial (>10KB)');
  assert.ok(result.text.includes('Test Cafe'), 'Text should mention restaurant name');
});
