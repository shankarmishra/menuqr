const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/app${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new Error('We could not reach MenusQR. Check your connection and try again.');
  }
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('menusqr:app-unauthorized'));
    }
    const result = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(result?.error ?? `Request failed (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

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
  templateId?: string;
  accentConfiguration?: unknown;
}

export interface OnboardingPayload {
  businessName: string;
  tagline?: string;
  phone?: string;
  city?: string;
  address?: string;
  logoUrl?: string;
  menuName?: string;
  templateId?: string;
  categories: Array<{ name: string; description?: string }>;
  items: Array<{ categoryIndex: number; name: string; description?: string; price: number; imageUrl?: string; dietType?: string; available?: boolean }>;
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

export function getMenu(): Promise<AppMenuData> {
  return request<AppMenuData>('/menu');
}

export function publishMenu(status: 'PUBLISHED' | 'DRAFT'): Promise<{ id: string; status: string }> {
  return request<{ id: string; status: string }>('/menu/publish', {
    method: 'POST',
    body: JSON.stringify({ status })
  });
}

export function saveOnboarding(data: OnboardingPayload): Promise<{ success: boolean; menuId: string }> {
  return request<{ success: boolean; menuId: string }>('/onboarding/save', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMenuItem(itemId: string, data: Partial<AppMenuItem> & { categoryId?: string; imageUrl?: string; dietType?: string; isAvailable?: boolean; pricingType?: string; variants?: AppVariant[]; addonGroups?: AppAddonGroup[] }): Promise<AppMenuItem> {
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

export function createMenuCategory(data: { name: string; description?: string; menuId: string }): Promise<{ id: string; name: string }> {
  return request<{ id: string; name: string }>('/categories', { method: 'POST', body: JSON.stringify(data) });
}

export function updateMenuCategory(categoryId: string, data: { name: string; description?: string }): Promise<{ id: string; name: string }> {
  return request<{ id: string; name: string }>(`/categories/${encodeURIComponent(categoryId)}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteMenuCategory(categoryId: string): Promise<void> {
  return request<void>(`/categories/${encodeURIComponent(categoryId)}`, { method: 'DELETE', body: '{}' });
}

export function createMenuItem(data: { menuId: string; categoryId: string; name: string; description?: string; price: number; imageUrl?: string; dietType?: string; pricingType?: string; variants?: AppVariant[]; addonGroups?: AppAddonGroup[] }): Promise<AppMenuItem> {
  return request<AppMenuItem>('/items', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteMenuItem(itemId: string): Promise<void> {
  return request<void>(`/items/${encodeURIComponent(itemId)}`, { method: 'DELETE', body: '{}' });
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

export function executeMenuImport(categories: any[], mode: 'add' | 'update' | 'skip' = 'add', filename: string = 'menu.xlsx'): Promise<any> {
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

export async function updateOrderStatus(id: string, status: string) {
  return request<any>(`/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}
export function renewSubscription(planId: string): Promise<any> { return request<any>('/subscription/renew', { method: 'POST', body: JSON.stringify({ planId }) }); }

