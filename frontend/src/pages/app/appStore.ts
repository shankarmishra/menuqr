import { ensureCsrfToken } from '../../utils/csrf';
import { parseApiResponse } from '../../utils/api';
import type { MenuTheme } from '../../design-system/theme.types.ts';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const method = (init?.method || 'GET').toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  let csrfHeaders: Record<string, string> = {};
  if (isStateChanging) {
    const token = await ensureCsrfToken();
    if (token) {
      csrfHeaders['X-CSRF-Token'] = token;
    }
  }

  try {
    response = await fetch(`${apiBaseUrl}/api/app${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
        ...init?.headers,
      },
    });
  } catch {
    throw new Error('We could not reach MenusQR. Check your connection and try again.');
  }

  if (response.status === 401) {
    window.dispatchEvent(new Event('menusqr:app-unauthorized'));
  }

  return parseApiResponse<T>(response);
}

import type { ItemTags } from '../../components/menu-renderer/types';
export interface AppProfile {
  id: string;
  businessName: string;
  tagline?: string;
  ownerName: string;
  email: string;
  menuSlug: string;
  phone?: string;
  city?: string;
  address?: string;
  logoUrl?: string;
  state?: string;
  cuisine?: string;
  openingHours?: string;
  logo?: string;
  instagram?: string;
  accentConfiguration?: any;
  facebook?: string;
  website?: string;
}

export interface AppDashboardData {
  stats: any; // Add proper typing if known
  recentActivity: any[];
}

export interface AppSubscriptionData {
  planId: string;
  status: string;
  startedAt?: string;
  expiresAt?: string;
  menuEditUsed?: boolean;
  contentChangesUsed?: number;
  contentChangesRemaining?: number;
  contentChangesLimit?: number;
}

export interface AppQrData {
  publicId?: string;
  qrId?: string;
  destinationType?: string;
  isActive?: boolean;
  created?: boolean;
  restaurantName?: string;
  phone?: string;
  city?: string;
  address?: string;
  logoUrl?: string;
  state?: string;
  cuisine?: string;
  openingHours?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  templateId?: string;
  accentConfiguration?: any;
}

export interface OnboardingPayload {
  businessName: string;
  tagline?: string;
  phone?: string;
  city?: string;
  address?: string;
  logoUrl?: string;
  state?: string;
  cuisine?: string;
  openingHours?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  menuName?: string;
  templateId?: string;
  categories: Array<{ name: string; description?: string }>;
  items: Array<{
    categoryIndex: number;
    name: string;
    description?: string;
    price: number;
    halfPrice?: number;
    fullPrice?: number;
    imageUrl?: string;
    dietType?: string;
    available?: boolean;
    /** Saved as `metadata.tags.badges: ['bestseller']` — what the Editions read for a hero dish. */
    isBestseller?: boolean;
    /** Photo crop centre, 0..1; saved as `metadata.focal`. */
    focalX?: number;
    focalY?: number;
  }>;
}

export interface StickerRequest {
  id: string;
  qrId: string;
  quantity: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState?: string;
  deliveryPostalCode?: string;
  notes?: string;
  status: 'PENDING' | 'REVIEWING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt?: string;
}

export interface AppVariant {
  id?: string;
  name: string;
  price: number;
  isAvailable?: boolean;
  variantGroup?: string;
}

export interface AppAddonOption {
  id?: string;
  name: string;
  price: number;
  isAvailable?: boolean;
}

export interface AppAddonGroup {
  id?: string;
  name: string;
  description?: string;
  isRequired?: boolean;
  minSelect?: number;
  maxSelect?: number;
  options: AppAddonOption[];
}

/** Owner-set photo crop anchor, 0-1 coordinates. Absent means "use the centre". */
export interface FocalPoint {
  x: number;
  y: number;
}

export interface AppMenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price?: number | string | null;
  half_price?: number | string | null;
  full_price?: number | string | null;
  pricing_type?: 'single' | 'variants';
  image_url?: string | null;
  diet_type?: string;
  is_available?: boolean;
  variants?: AppVariant[];
  addon_groups?: AppAddonGroup[];
  /** Stored in the backend's `menu_items.metadata` JSONB column; currently only ever holds `focal`. */
  metadata?: { focal?: FocalPoint; tags?: ItemTags | null; soldOutOn?: string } | null;
}

export interface AppMenuImportHistory {
  id: string;
  filename: string;
  status: string;
  categories_count: number;
  items_count: number;
  variants_count: number;
  addons_count: number;
  skipped_count: number;
  created_at: string;
}

export interface AppMenuData {
  menu: { id: string; name: string; status?: 'PUBLISHED' | 'DRAFT'; published_at?: string; menuSlug?: string } | null;
  categories: Array<{ id: string; name: string; description?: string; items: AppMenuItem[] }>;
  importHistory?: AppMenuImportHistory[];
}

export function getProfile(): Promise<AppProfile> {
  return request<AppProfile>('/profile');
}

export function getDashboard(): Promise<AppDashboardData> {
  return request<AppDashboardData>('/dashboard');
}

export function getSubscription(): Promise<AppSubscriptionData> {
  return request<AppSubscriptionData>('/subscription');
}

export interface AppAppearanceData {
  templateId?: string;
  logo?: string | null;
  coverImage?: string | null;
  restaurantDisplayName?: string | null;
  tagline?: string | null;
  accentConfiguration?: unknown;
}

export function getAppearance(): Promise<AppAppearanceData> {
  return request<AppAppearanceData>('/appearance');
}

export function updateAppearance(data: AppAppearanceData): Promise<AppAppearanceData> {
  return request<AppAppearanceData>('/appearance', { method: 'PUT', body: JSON.stringify(data) });
}

// ─────────────────────── Design Studio theme: draft / publish / rollback ───────────────────────

export interface ThemeState {
  draft: MenuTheme | null;
  published: MenuTheme | null;
  version: number;
  hasUnpublishedChanges: boolean;
}

export interface ThemeHistoryEntry {
  version: number;
  theme: MenuTheme;
  createdAt: string;
}

/** Current draft and published theme, plus whether the draft has unpublished edits. */
export function getTheme(): Promise<ThemeState> {
  return request<ThemeState>('/theme');
}

/**
 * Autosave a draft. Accepted leniently by the backend (coerced, not strictly validated) so
 * saving mid-edit never surfaces a 400 for a field the owner has not finished changing yet.
 */
export function saveThemeDraft(theme: MenuTheme): Promise<{ draft: MenuTheme }> {
  return request<{ draft: MenuTheme }>('/theme/draft', { method: 'PUT', body: JSON.stringify(theme) });
}

/**
 * Publish a theme to the public menu. Strictly validated server-side — a malformed theme is
 * rejected outright, not silently repaired, because this is what customers actually see.
 * Omitting `theme` publishes whatever was last autosaved as the draft.
 */
export function publishTheme(theme?: MenuTheme): Promise<{ published: MenuTheme; version: number }> {
  return request<{ published: MenuTheme; version: number }>('/theme/publish', {
    method: 'POST',
    body: JSON.stringify(theme ?? {}),
  });
}

/** The last 20 published versions, newest first, for the Studio's version history panel. */
export function getThemeHistory(): Promise<ThemeHistoryEntry[]> {
  return request<ThemeHistoryEntry[]>('/theme/history');
}

/** Restores a prior published version. This is itself a new version, not a rewind — rolling back twice returns to the version before the first rollback, not to the original. */
export function rollbackTheme(version: number): Promise<{ published: MenuTheme; version: number }> {
  return request<{ published: MenuTheme; version: number }>('/theme/rollback', {
    method: 'POST',
    body: JSON.stringify({ version }),
  });
}

export function uploadImage(
  image: string,
  category: 'dishes' | 'logos' | 'covers' = 'dishes',
  maxWidth = 1200
): Promise<{ success: boolean; url: string }> {
  return request<{ success: boolean; url: string }>('/upload-image', {
    method: 'POST',
    body: JSON.stringify({ image, category, maxWidth }),
  });
}

export function getMenu(): Promise<AppMenuData> {
  return request<AppMenuData>('/menu');
}

export function publishMenu(status: 'PUBLISHED' | 'DRAFT'): Promise<{ id: string; status: string }> {
  return request<{ id: string; status: string }>('/menu/publish', {
    method: 'POST',
    body: JSON.stringify({ status })
  });
}

export function resolveMenuImages(
  items: Array<{ index: number; name: string; category?: string }>
): Promise<{ matches: Array<{ index: number; imageUrl: string }> }> {
  return request<{ matches: Array<{ index: number; imageUrl: string }> }>('/menu/resolve-images', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export function saveOnboarding(data: OnboardingPayload): Promise<{ success: boolean; menuId: string }> {
  return request<{ success: boolean; menuId: string }>('/onboarding/save', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMenuItem(itemId: string, data: Partial<AppMenuItem> & { categoryId?: string; imageUrl?: string; dietType?: string; isAvailable?: boolean; pricingType?: string; variants?: AppVariant[]; addonGroups?: AppAddonGroup[]; focal?: FocalPoint | null; tags?: ItemTags | null }): Promise<AppMenuItem> {
  return request<AppMenuItem>(`/items/${encodeURIComponent(itemId)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function duplicateMenuItem(itemId: string): Promise<AppMenuItem> {
  return request<AppMenuItem>('/items/duplicate', {
    method: 'POST',
    body: JSON.stringify({ itemId })
  });
}

export function bulkUpdateMenuItems(itemIds: string[], action: 'change_category' | 'change_availability' | 'adjust_price' | 'delete', payload?: any): Promise<{ success: boolean; count: number }> {
  return request<{ success: boolean; count: number }>('/items/bulk-update', {
    method: 'POST',
    body: JSON.stringify({ itemIds, action, payload })
  });
}

export function getQr(): Promise<AppQrData | null> {
  return request<AppQrData | null>('/qr');
}

export function createPermanentQr(): Promise<AppQrData> {
  return request<AppQrData>('/qr', { method: 'POST', body: '{}' });
}

export function createMenuCategory(data: { name: string; description?: string; menuId: string; schedule?: { from: string; to: string; days?: number[] } | null }): Promise<{ id: string; name: string }> {
  return request<{ id: string; name: string }>('/categories', { method: 'POST', body: JSON.stringify(data) });
}

export function updateMenuCategory(categoryId: string, data: { name: string; description?: string; schedule?: { from: string; to: string; days?: number[] } | null }): Promise<{ id: string; name: string }> {
  return request<{ id: string; name: string }>(`/categories/${encodeURIComponent(categoryId)}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteMenuCategory(categoryId: string): Promise<void> {
  return request<void>(`/categories/${encodeURIComponent(categoryId)}`, { method: 'DELETE', body: '{}' });
}

export function createMenuItem(data: { menuId: string; categoryId: string; name: string; description?: string; price: number; imageUrl?: string; dietType?: string; pricingType?: string; variants?: AppVariant[]; addonGroups?: AppAddonGroup[]; focal?: FocalPoint | null; tags?: ItemTags | null }): Promise<AppMenuItem> {
  return request<AppMenuItem>('/items', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteMenuItem(itemId: string): Promise<void> {
  return request<void>(`/items/${encodeURIComponent(itemId)}`, { method: 'DELETE', body: '{}' });
}

export interface AppAnalytics {
  range: number;
  from: string;
  to: string;
  traffic: {
    days: Array<{ day: string; scans: number; views: number }>;
    totals: { scans: number; views: number };
    previous: { scans: number; views: number };
    change: { scans: number | null; views: number | null };
    hours: number[];
  };
  /** Null on plans without ordering. */
  orders: null | {
    days: Array<{ day: string; orders: number; revenue: number }>;
    totals: { orders: number; revenue: number; averageOrderValue: number };
    previous: { orders: number; revenue: number };
    change: { orders: number | null; revenue: number | null };
    hours: number[];
    byType: Array<{ type: string; orders: number; revenue: number }>;
    topItems: Array<{ name: string; quantity: number; revenue: number }>;
  };
}

export type FeedbackSummary = {
  count: number;
  average: number;
  distribution: [number, number, number, number, number];
  recent: Array<{
    id: string;
    rating: number;
    comment: string | null;
    contact: string | null;
    tableNumber: string | null;
    createdAt: string;
  }>;
};

export type VoiceGreetingPayload = {
  enabled: boolean;
  messageStyle?: 'hinglish_warm' | 'hindi_respectful' | 'english_welcome' | 'custom';
  customText?: string;
  voiceGender?: 'female' | 'male';
};

export function saveVoiceGreeting(payload: VoiceGreetingPayload): Promise<{ success: boolean; voiceGreeting: any }> {
  return request('/voice-greeting', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function previewVoiceGreeting(payload: Omit<VoiceGreetingPayload, 'enabled'>): Promise<{ audioBase64: string; text: string }> {
  return request('/voice-greeting/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getFeedback(limit = 50): Promise<FeedbackSummary> {
  return request<FeedbackSummary>(`/feedback?limit=${limit}`);
}

export function getAnalytics(range: 7 | 30): Promise<AppAnalytics> {
  return request<AppAnalytics>(`/analytics?range=${range}`);
}

export function setMenuItemSoldOut(itemId: string, soldOut: boolean): Promise<{ id: string; soldOut: boolean; soldOutOn: string | null }> {
  return request(`/items/${encodeURIComponent(itemId)}/sold-out`, { method: 'POST', body: JSON.stringify({ soldOut }) });
}

export function setMenuItemAvailability(itemId: string, isAvailable: boolean): Promise<AppMenuItem> {
  return request<AppMenuItem>(`/items/${encodeURIComponent(itemId)}/availability`, { method: 'PATCH', body: JSON.stringify({ isAvailable }) });
}

export function previewMenuImport(headers: string[], rawRows: any[]): Promise<{ detectedColumns: Record<string, string>; summary: any; categories: any[]; issues: any[] }> {
  return request('/menu/import/preview', {
    method: 'POST',
    body: JSON.stringify({ headers, rawRows })
  });
}

export function executeMenuImport(categories: any[], mode: 'add' | 'update' | 'skip' | 'replace' = 'add', filename: string = 'menu.xlsx'): Promise<any> {
  return request('/menu/import/execute', {
    method: 'POST',
    body: JSON.stringify({ categories, mode, filename })
  });
}

export function getMenuImportHistory(): Promise<AppMenuImportHistory[]> {
  return request<AppMenuImportHistory[]>('/menu/import/history');
}

export function getStickerRequests(): Promise<StickerRequest[]> {
  return request<StickerRequest[]>('/sticker-requests');
}

export function createStickerRequest(data: Omit<StickerRequest, 'id' | 'qrId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<StickerRequest> {
  return request<StickerRequest>('/sticker-requests', { method: 'POST', body: JSON.stringify(data) });
}

export function updateSettings(data: any): Promise<any> {
  return request<any>('/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getOrders() {
  return request<any[]>('/orders');
}

export async function updateOrderStatus(id: string, status: string, rejectionReason?: string, estimatedTimeMinutes?: number) {
  return request<any>(`/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejectionReason, estimatedTimeMinutes })
  });
}

export async function updateOrderEstimatedTime(id: string, estimatedTimeMinutes: number) {
  return request<any>(`/orders/${encodeURIComponent(id)}/time`, {
    method: 'PATCH',
    body: JSON.stringify({ estimatedTimeMinutes })
  });
}
export function renewSubscription(planId: string): Promise<any> { return request<any>('/subscription/renew', { method: 'POST', body: JSON.stringify({ planId }) }); }

export interface GoogleReviewsAddonStatus {
  addonId: string;
  status: 'SETUP_REQUIRED' | 'ACTIVE' | 'EXPIRED' | 'NOT_SUBSCRIBED';
  reviewUrl: string | null;
  expiresAt: string | null;
  updatedAt: string | null;
  canConfigure: boolean;
}

export function getGoogleReviewsAddon(): Promise<GoogleReviewsAddonStatus> {
  return request<GoogleReviewsAddonStatus>('/addons/google-reviews');
}

export function updateGoogleReviewsAddon(reviewUrl: string): Promise<{ success: boolean; status: string; reviewUrl: string; updatedAt: string }> {
  return request('/addons/google-reviews', {
    method: 'PUT',
    body: JSON.stringify({ reviewUrl }),
  });
}

export function deleteGoogleReviewsAddon(): Promise<{ success: boolean; status: string; reviewUrl: null }> {
  return request('/addons/google-reviews', {
    method: 'DELETE',
  });
}
