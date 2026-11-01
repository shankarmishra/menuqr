import type { ReactNode } from 'react';
import type { MenuTheme } from '../../design-system/theme.types';

export const DEFAULT_VIEWPORT_WIDTH = 390;
export const DEFAULT_VIEWPORT_HEIGHT = 844;
export const FRAME_BORDER_HORIZONTAL = 20; // 10px bezel padding each side
export const FRAME_BORDER_VERTICAL = 20; // 10px bezel padding top and bottom

export interface PhonePreviewSyncPayload {
  theme?: MenuTheme | null;
  presetId?: string;
  colors?: {
    seed: string;
    mode: 'light' | 'dark';
    palette?: Record<string, string>;
  };
  fontPairing?: string;
  slots?: MenuTheme['slots'];
  signatureId?: string | null;
  timestamp: number;
}

export interface PhonePreviewSyncMessage {
  type: 'MENUQR_THEME_SYNC';
  payload: PhonePreviewSyncPayload;
}

export interface PhonePreviewFrameProps {
  children: ReactNode;
  theme?: MenuTheme | null;
  presetId?: string;
  palette?: {
    bg?: string;
    card?: string;
    heading?: string;
    text?: string;
    accent?: string;
  };
  /** Inner standard viewport width in pixels (default: 390 for iPhone 14/15/16) */
  viewportWidth?: number;
  /** Inner standard viewport height in pixels (default: 844 for iPhone 14/15/16) */
  viewportHeight?: number;
  /** Enable responsive scale-to-fit transform when screen space is tight (default: true) */
  scaleToFit?: boolean;
  /** Badge text shown on top status bar (optional) */
  badgeText?: string;
  /** Status bar contrast theme (default: auto from theme or palette.bg) */
  statusBarTheme?: 'dark' | 'light';
  /** Show top Dynamic Island / notch (default: true) */
  showDynamicIsland?: boolean;
  /** Show iOS home indicator bar at bottom (default: true) */
  showHomeIndicator?: boolean;
  /** Optional class for outer container */
  className?: string;
  /** Optional class for inner screen viewport */
  screenClassName?: string;
  /** Optional style for inner screen viewport */
  screenStyle?: React.CSSProperties;
  /** Optional scroll container ref */
  scrollRef?: React.Ref<HTMLDivElement>;
  /** Use real same-origin iframe for CSS & media-query isolation (default: true in browser) */
  useIframe?: boolean;
  /** Callback fired when a postMessage theme sync event is received */
  onSyncMessage?: (payload: PhonePreviewSyncPayload) => void;
  /** Overrides */
  time?: string;
}
