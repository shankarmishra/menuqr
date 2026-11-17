/**
 * MENUQR Design System — Zod Theme Configuration Schema (Version 2)
 *
 * Provides strict structural validation and type-coercion using Zod.
 * Rejects unvalidated properties, unknown keys, and hostile payloads (such as arbitrary CSS injection,
 * malicious URLs, control characters, or script schemes) across all boundaries.
 */

import { z } from 'zod';
import {
  COVER_SLOTS,
  DISH_CARD_SLOTS,
  FOOTER_SLOTS,
  LOGO_SHAPES,
  NAV_SLOTS,
  SECTION_SLOTS,
  SIGNATURE_COMPOSITION_IDS,
  TEXTURE_IDS,
  THEME_VERSION,
  type MenuTheme,
} from './theme.types.ts';
import { FONT_PAIRING_IDS } from './fonts.ts';
import { sanitizeImageUrl } from './validateTheme.ts';

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const PRESET_ID_REGEX = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** Strict URL validator using sanitizeImageUrl boundary. Rejects javascript:, data:, vbscript:. */
const SafeUrlSchema = z
  .string()
  .max(2048)
  .refine(
    (val) => sanitizeImageUrl(val) !== null,
    { message: 'Must be a valid same-origin path or http(s) URL' }
  );

/** Strips control codes and validates announcement text. Rejects <style> tags and CSS injection. */
const SafeTextSchema = z
  .string()
  .max(120)
  .refine((val) => {
    for (let i = 0; i < val.length; i += 1) {
      const code = val.charCodeAt(i);
      if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) return false;
    }
    return true;
  }, { message: 'Must not contain control characters' })
  .refine((val) => !/<\s*\/?\s*style[\s>]/i.test(val), {
    message: 'Must not contain <style> tags',
  })
  .refine((val) => !/expression\s*\(|behavior\s*:|javascript\s*:/i.test(val), {
    message: 'Must not contain CSS injection',
  });

export const ThemeBrandSchema = z
  .object({
    seedColor: z.string().regex(HEX_COLOR_REGEX, 'Must be a valid hex color string'),
    logoUrl: SafeUrlSchema.nullable(),
    logoShape: z.enum(LOGO_SHAPES as unknown as [string, ...string[]]),
  })
  .strict();

export const ThemeSlotsSchema = z
  .object({
    cover: z.enum(COVER_SLOTS as unknown as [string, ...string[]]),
    nav: z.enum(NAV_SLOTS as unknown as [string, ...string[]]),
    dishCard: z.enum(DISH_CARD_SLOTS as unknown as [string, ...string[]]),
    section: z.enum(SECTION_SLOTS as unknown as [string, ...string[]]),
    footer: z.enum(FOOTER_SLOTS as unknown as [string, ...string[]]),
  })
  .strict();

export const ThemeFocalPointSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  })
  .strict();

export const ThemeCoverSchema = z
  .object({
    imageUrl: SafeUrlSchema.nullable(),
    focal: ThemeFocalPointSchema,
    overlayStrength: z.number().min(0).max(1),
    showCoverPage: z.boolean(),
  })
  .strict();

export const ThemeConfigurationSchema = z
  .object({
    version: z.literal(THEME_VERSION),
    layoutVersion: z.union([z.literal(1), z.literal(2)]).optional(),
    presetId: z.string().regex(PRESET_ID_REGEX, 'Preset ID must be a lowercase alphanumeric slug'),
    mode: z.enum(['light', 'dark']),
    brand: ThemeBrandSchema,
    slots: ThemeSlotsSchema,
    signatureId: z.enum(SIGNATURE_COMPOSITION_IDS as unknown as [string, ...string[]]).nullable().optional(),
    typePair: z.enum(FONT_PAIRING_IDS as unknown as [string, ...string[]]),
    texture: z.enum(TEXTURE_IDS as unknown as [string, ...string[]]),
    density: z.enum(['compact', 'balanced', 'spacious']),
    radius: z.enum(['none', 'sm', 'md', 'lg', 'xl', 'full']),
    shadow: z.enum(['none', 'subtle', 'elevated', 'glass']),
    cover: ThemeCoverSchema,
    announcement: SafeTextSchema.nullable().optional(),
  })
  .strict();

export type ValidatedThemeConfiguration = z.infer<typeof ThemeConfigurationSchema>;

/**
 * Validates untrusted theme payload against Zod ThemeConfigurationSchema.
 * Explicitly rejects arbitrary CSS payloads, extra properties, and hostile vectors.
 */
export function validateThemeSchema(input: unknown): {
  ok: boolean;
  data?: MenuTheme;
  errors?: string[];
} {
  const result = ThemeConfigurationSchema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data as unknown as MenuTheme };
  }
  return {
    ok: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  };
}
