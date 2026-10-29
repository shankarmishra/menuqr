/**
 * MENUQR — Real AI Voice Greeting Generator
 *
 * Uses Gemini 3.8 Flash TTS to produce authentic, human-like voice greetings
 * in natural Hinglish or respectful Hindi for diners scanning the QR code at the table.
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';
import { getStorage } from './storage/index.js';

const VOICE_PRESETS = {
  hinglish_warm: {
    getText: (name) => `नमस्ते! Welcome to ${name}! Please menu dekhiye aur bataiye aaj aapke liye kya layein!`,
    style: 'cheerful, lively, hospitable and smiling Indian restaurant hostess with natural Hinglish accent',
    femaleVoice: 'Sulafat',
    maleVoice: 'Fenrir',
  },
  hindi_respectful: {
    getText: (name) => `नमस्ते! ${name} में आपका हार्दिक स्वागत है! बताइए, आज आप क्या खाना पसंद करेंगे?`,
    style: 'respectful, sweet, traditional and hospitable Indian Hindi restaurant hostess',
    femaleVoice: 'Sulafat',
    maleVoice: 'Orus',
  },
  english_welcome: {
    getText: (name) => `Hello and welcome to ${name}! Please explore our fresh menu and enjoy your dining experience!`,
    style: 'warm, welcoming and pleasant restaurant hospitality voice',
    femaleVoice: 'Aoede',
    maleVoice: 'Puck',
  },
};

/**
 * Generates an audio WAV buffer using Gemini 3.8 Flash TTS.
 */
export async function synthesizeVoiceGreeting({
  businessName,
  messageStyle = 'hinglish_warm',
  customText = '',
  voiceGender = 'female',
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment.');
  }

  const ai = new GoogleGenAI({ apiKey });

  let textToSpeak = '';
  let stylePrompt = '';
  let selectedVoice = '';

  const preset = VOICE_PRESETS[messageStyle] || VOICE_PRESETS.hinglish_warm;

  if (messageStyle === 'custom' && customText && customText.trim()) {
    textToSpeak = customText.trim().slice(0, 200);
    stylePrompt = 'warm, hospitable, friendly and smiling Indian restaurant voice greeting guests';
    selectedVoice = voiceGender === 'male' ? 'Fenrir' : 'Sulafat';
  } else {
    textToSpeak = preset.getText(businessName || 'the restaurant');
    stylePrompt = preset.style;
    selectedVoice = voiceGender === 'male' ? preset.maleVoice : preset.femaleVoice;
  }

  const response = await ai.interactions.create({
    model: 'gemini-3.8-flash-tts',
    input: [{
      type: 'user_input',
      content: [{
        type: 'text',
        text: textToSpeak,
        annotations: [{
          type: 'speech_metadata',
          style: stylePrompt,
        }],
      }],
    }],
    response_format: { type: 'audio' },
    generation_config: {
      speech_config: [{ voice: selectedVoice }],
    },
  });

  if (!response.output_audio?.data) {
    throw new Error('No audio data received from speech synthesis.');
  }

  return {
    audioBuffer: Buffer.from(response.output_audio.data, 'base64'),
    text: textToSpeak,
  };
}

/**
 * Generates and stores the voice greeting file for a tenant, returning the public audio URL.
 */
export async function saveTenantVoiceGreeting({
  tenantId,
  businessName,
  messageStyle = 'hinglish_warm',
  customText = '',
  voiceGender = 'female',
}) {
  const { audioBuffer, text } = await synthesizeVoiceGreeting({
    businessName,
    messageStyle,
    customText,
    voiceGender,
  });

  const storage = getStorage();
  const filename = `voice_${tenantId}_${Date.now()}.wav`;
  const storageKey = `voices/${filename}`;

  const { url } = await storage.put(storageKey, audioBuffer, 'audio/wav');

  return {
    audioUrl: url,
    text,
    messageStyle,
    voiceGender,
  };
}
