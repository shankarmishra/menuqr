/**
 * Onboarding chrome tokens.
 *
 * The wizard is the first thing a paying client sees, and what it is selling is the Signature
 * Edition catalogue — charcoal paper, 24K gold rules, serif display type. Until now it wore the
 * flat dashboard shell, so the product looked cheaper than the templates inside it.
 *
 * These are plain constants rather than CSS custom properties on purpose: this is app chrome, not
 * a rendered client menu, so it is outside the `var(--mq-*)` contract that the menu renderer and
 * its components must obey (`design-system/theme.types.ts`). The brand orange stays the primary
 * action colour so the wizard still reads as MENUSQR.
 */

export const OB = {
  /** Page canvas — espresso charcoal, warmer than the dashboard's cool green-black. */
  canvas: '#12100D',
  canvasDeep: '#0C0A08',
  /** Step card. */
  panel: '#1A1713',
  /** Controls and rows sitting on the step card. */
  panelRaised: '#231E18',
  panelHover: '#2B251D',

  gold: '#D4AF37',
  goldLight: '#F0D98A',
  goldLine: 'rgba(212, 175, 55, 0.26)',
  goldLineSoft: 'rgba(212, 175, 55, 0.14)',
  goldWash: 'rgba(212, 175, 55, 0.08)',

  ink: '#F6F0E4',
  inkSoft: '#D8CEBC',
  inkMuted: '#A3957E',
  inkFaint: '#766A58',

  /** Primary action — unchanged brand orange. */
  cta: '#E8783C',
  ctaHover: '#F08B55',
  ok: '#34B56A',
  danger: '#F2616B',
} as const;

/** Display face for step titles. Self-hosted via `design-system/fonts.generated.css`. */
export const DISPLAY = "'Playfair Display', 'Cinzel', Georgia, serif";

/** Shared class strings, so a control looks the same in every step without a wrapper component. */
export const OB_CLASS = {
  input:
    'w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#F6F0E4] placeholder:text-[#766A58] transition-colors focus:outline-none',
  card: 'rounded-2xl border shadow-lg',
  pill: 'rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
} as const;

/** `style` for a text input / select, in the chrome's palette. */
export const inputStyle = {
  background: OB.canvasDeep,
  borderColor: OB.goldLineSoft,
} as const;
