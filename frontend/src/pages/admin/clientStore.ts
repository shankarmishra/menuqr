export type ClientCategory = 'restaurants' | 'dhabas' | 'cafes';
export type MenuDietType = 'veg' | 'non-veg' | 'vegan';

export interface MenuItemRecord {
  id: string;
  name: string;
  description: string;
  price: string;
  pricingType?: 'single' | 'half-full' | 'sizes' | 'variants';
  halfPrice?: string;
  fullPrice?: string;
  regPrice?: string;
  medPrice?: string;
  largePrice?: string;
  category: string;
  dietType: MenuDietType;
  image: string;
  available: boolean;
  variants?: Array<{ id?: string; name: string; price: number; variantGroup?: string }>;
}

export interface ClientRecord {
  id: string;
  businessName: string;
  category: ClientCategory;
  ownerName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  templateId?: string;
  accentConfiguration?: unknown;
  postalCode: string;
  country: string;
  menuSlug: string;
  plan: string;
  billingCycle: string;
  monthlyPrice: string;
  openingHours: string;
  services: string[];
  menuItems: MenuItemRecord[];
  heroImage?: string;
  status: string;
  notes: string;
  createdAt: string;
}

export interface PublicMenuRecord {
  businessName: string;
  tagline?: string;
  logoUrl?: string;
  category: ClientCategory;
  phone: string;
  address: string;
  city: string;
  state: string;
  website: string;
  instagram?: string;
  facebook?: string;
  cuisine?: string;
  openingHours: string;
  services: string[];
  heroImage?: string;
  categories?: Array<{ id: string; name: string; order: number }>;
  menuItems: MenuItemRecord[];
  plan?: string;
  orderingEnabled?: boolean;
  templateId?: string;
  accentConfiguration?: unknown;
  googleReviews?: {
    enabled: boolean;
    reviewUrl?: string;
  };
}


export interface ApiHealth {
  status: 'ok';
  storage: string;
  clients: number;
}

export interface AdminNotification {
  id: string;
  type: 'new-user';
  user?: { clientId?: string; name?: string; email?: string; phone?: string };
  message: string;
  source: string;
  status: 'unread' | 'read';
  createdAt: string;
  readAt: string | null;
}

export interface AdminSession {
  authenticated: boolean;
  user?: { role?: string } | null;
}

const storageKey = 'menusqr.clients';
import { ensureCsrfToken, setCsrfToken } from '../../utils/csrf';
import { parseApiResponse } from '../../utils/api';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const draftStorageKey = 'menusqr.clientDrafts';
const migrationStorageKey = 'menusqr.apiMigration.v1';

let activeAuthToken: string | null = null;
export function setAuthToken(token: string | null | undefined): void {
  if (token) {
    activeAuthToken = token;
    try {
      sessionStorage.setItem('menusqr_auth_token', token);
      localStorage.setItem('menusqr_auth_token', token);
    } catch {}
  } else {
    activeAuthToken = null;
    try {
      sessionStorage.removeItem('menusqr_auth_token');
      localStorage.removeItem('menusqr_auth_token');
    } catch {}
  }
}

export function getAuthToken(): string | null {
  if (activeAuthToken) return activeAuthToken;
  try {
    const saved = localStorage.getItem('menusqr_auth_token') || sessionStorage.getItem('menusqr_auth_token');
    if (saved) {
      activeAuthToken = saved;
      return saved;
    }
  } catch {}
  return null;
}

type ClientDraft = Omit<ClientRecord, 'id' | 'createdAt'>;
let migrationPromise: Promise<void> | undefined;
const apiBaseUrl = getApiBaseUrl();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  const authToken = getAuthToken();
  const authHeaders: Record<string, string> = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

  let csrfHeaders: Record<string, string> = {};
  if (isStateChanging) {
    const token = await ensureCsrfToken();
    if (token) {
      csrfHeaders['X-CSRF-Token'] = token;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...csrfHeaders,
        ...init?.headers,
      },
    });
  } catch (err: any) {
    throw new Error(err?.message || 'We could not reach the MenusQR server. Check your connection.');
  }

  if (response.status === 401 && path.startsWith('/admin/')) {
    window.dispatchEvent(new Event('menusqr:admin-unauthorized'));
  }

  return parseApiResponse<T>(response);
}

function getLegacyClients(): ClientRecord[] {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as ClientRecord[]) : [];
  } catch {
    return [];
  }
}

async function migrateLegacyClients(clients: ClientRecord[]): Promise<ClientRecord[]> {
  if (localStorage.getItem(migrationStorageKey)) return clients;
  if (!migrationPromise) {
    migrationPromise = (async () => {
      for (const legacyClient of getLegacyClients()) {
        if (clients.some((client) => client.menuSlug === legacyClient.menuSlug)) continue;
        try {
          await request<ClientRecord>('/admin/clients', {
            method: 'POST',
            body: JSON.stringify(legacyClient),
            headers: { 'X-MenusQR-Import': 'legacy' },
          });
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes('already in use')) throw error;
        }
      }
      localStorage.setItem(migrationStorageKey, 'done');
    })();
  }
  try {
    await migrationPromise;
  } finally {
    migrationPromise = undefined;
  }
  return request<ClientRecord[]>('/admin/clients');
}

export async function getClients(): Promise<ClientRecord[]> {
  return migrateLegacyClients(await request<ClientRecord[]>('/admin/clients'));
}

export async function getOrders(): Promise<any[]> {
  return request<any[]>('/admin/orders');
}

export async function getPayments(): Promise<any[]> {
  return request<any[]>('/admin/payments');
}

export function getApiHealth(): Promise<ApiHealth> {
  return request<ApiHealth>('/health');
}

export function getNotifications(): Promise<AdminNotification[]> {
  return request<AdminNotification[]>('/admin/notifications');
}

export interface TimelineEvent {
  type: 'CLIENT_JOINED' | 'ORDER_CREATED' | 'PAYMENT_RECEIVED';
  entity_id: string;
  details: string;
  time: string;
}

export function getAdminTimeline(): Promise<TimelineEvent[]> {
  return request<TimelineEvent[]>('/admin/timeline');
}

export function clearNotifications(): Promise<{ deletedCount: number }> {
  return request<{ deletedCount: number }>('/admin/notifications', { method: 'DELETE' });
}

export function markNotificationRead(id: string): Promise<{ status: 'read' }> {
  return request<{ status: 'read' }>(
    `/admin/notifications/${encodeURIComponent(id)}/read`,
    { method: 'PATCH' }
  );
}

export function getAdminSession(): Promise<AdminSession> {
  return request<AdminSession>('/auth/session');
}

export interface LoginResponse {
  authenticated?: boolean;
  role?: string;
  requireOtp?: boolean;
  tempToken?: string;
  email?: string;
  message?: string;
  token?: string;
  onboardingState?: string;
}

export async function loginAdmin(password: string, email?: string): Promise<LoginResponse> {
  const res = await request<LoginResponse & { csrfToken?: string; token?: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password, email }),
  });
  if (res.csrfToken) setCsrfToken(res.csrfToken);
  if (res.token) setAuthToken(res.token);
  return res;
}

export async function verifyLoginOtp(tempToken: string, otp: string): Promise<LoginResponse> {
  const res = await request<LoginResponse & { csrfToken?: string; token?: string }>('/auth/verify-login-otp', {
    method: 'POST',
    body: JSON.stringify({ tempToken, otp }),
  });
  if (res.csrfToken) setCsrfToken(res.csrfToken);
  if (res.token) setAuthToken(res.token);
  return res;
}

export async function resendLoginOtp(tempToken: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/auth/resend-login-otp', {
    method: 'POST',
    body: JSON.stringify({ tempToken }),
  });
}

export async function requestForgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

export async function logoutAdmin(): Promise<AdminSession> {
  const res = await request<AdminSession>('/auth/logout', { method: 'POST', body: '{}' });
  setCsrfToken(null);
  setAuthToken(null);
  return res;
}

export async function requestSuperAdminOtp(email: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/auth/admin/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifySuperAdminOtp(email: string, otp: string): Promise<LoginResponse> {
  const res = await request<LoginResponse & { csrfToken?: string; token?: string }>('/auth/admin/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  if (res.csrfToken) setCsrfToken(res.csrfToken);
  if (res.token) setAuthToken(res.token);
  return res;
}

export async function logoutSuperAdmin(): Promise<AdminSession> {
  const res = await request<AdminSession>('/auth/admin/logout', { method: 'POST', body: '{}' });
  setCsrfToken(null);
  setAuthToken(null);
  return res;
}

export async function getClient(id: string): Promise<ClientRecord | undefined> {
  await getClients();
  try {
    return await request<ClientRecord>(`/admin/clients/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Client not found.') return undefined;
    throw error;
  }
}

// Raw shape returned by GET /api/public/menus/:slug
interface RawPublicMenuApiResponse {
  isExpired?: boolean;
  menuSlug?: string;
  restaurant: {
    name: string;
    tagline?: string;
    category?: string;
    phone?: string;
    address?: string;
    city?: string;
    logo?: string;
  };
  plan: string;
  orderingEnabled?: boolean;
  templateId?: string;
  accentConfiguration?: unknown;
  googleReviews?: {
    enabled: boolean;
    reviewUrl?: string;
  };
  categories: Array<{ id: string; name: string; order: number }>;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    halfPrice?: number | null;
    fullPrice?: number | null;
    pricingType?: string;
    category: string;
    dietType: 'veg' | 'non-veg' | 'vegan';
    available: boolean;
    image?: string;
    variants?: Array<{ id?: string; name: string; price: number; variantGroup?: string }>;
  }>;
}

function mapPublicMenu(raw: RawPublicMenuApiResponse): PublicMenuRecord {
  const menuItems: MenuItemRecord[] = raw.items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    price: String(item.price),
    pricingType: (item.pricingType as any) || (item.variants && item.variants.length > 0 ? 'variants' : (item.halfPrice || item.fullPrice ? 'half-full' : 'single')),
    halfPrice: item.halfPrice !== undefined && item.halfPrice !== null ? String(item.halfPrice) : '',
    fullPrice: item.fullPrice !== undefined && item.fullPrice !== null ? String(item.fullPrice) : '',
    regPrice: '',
    medPrice: '',
    largePrice: '',
    category: item.category,
    dietType: (item.dietType ?? 'veg') as MenuDietType,
    image: item.image ?? '',
    available: item.available,
    variants: item.variants,
  }));
  return {
    businessName: raw.restaurant.name,
    tagline: raw.restaurant.tagline ?? '',
    logoUrl: raw.restaurant.logo || undefined,
    category: (raw.restaurant.category ?? 'restaurants') as ClientCategory,
    phone: raw.restaurant.phone ?? '',
    address: raw.restaurant.address ?? '',
    city: raw.restaurant.city ?? '',
    state: (raw.restaurant as any).state || '',
    website: (raw.restaurant as any).website || '',
    openingHours: (raw.restaurant as any).openingHours || '',
    instagram: (raw.restaurant as any).instagram || undefined,
    facebook: (raw.restaurant as any).facebook || undefined,
    cuisine: (raw.restaurant as any).cuisine || undefined,
    services: [],
    heroImage: undefined,
    categories: raw.categories,
    menuItems,
    plan: raw.plan,
    orderingEnabled: raw.orderingEnabled,
    templateId: raw.templateId,
    accentConfiguration: raw.accentConfiguration,
    googleReviews: raw.googleReviews,
  };
}

export async function getClientByMenuSlug(slug: string): Promise<PublicMenuRecord | undefined> {
  let raw: RawPublicMenuApiResponse;
  try {
    raw = await request<RawPublicMenuApiResponse>(`/public/menus/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof Error && error.message === 'SUBSCRIPTION_EXPIRED') {
      throw error;
    }
    if (error instanceof Error && (
      error.message === 'This menu is unavailable.' ||
      error.message.includes('404')
    )) return undefined;
    throw error;
  }

  return mapPublicMenu(raw);
}

export async function getClientByQrId(qrId: string): Promise<{ menuSlug: string; client: PublicMenuRecord }> {
  const raw = await request<RawPublicMenuApiResponse>(`/public/qr/${encodeURIComponent(qrId)}`);
  if (!raw.menuSlug) throw new Error('This permanent menu link is unavailable.');
  return { menuSlug: raw.menuSlug, client: mapPublicMenu(raw) };
}

export function createClient(client: Omit<ClientRecord, 'id' | 'createdAt'>): Promise<ClientRecord> {
  return request<ClientRecord>('/admin/clients', { method: 'POST', body: JSON.stringify(client) });
}

export function saveClient(client: ClientRecord): Promise<ClientRecord> {
  return request<ClientRecord>(`/admin/clients/${encodeURIComponent(client.id)}`, {
    method: 'PUT',
    body: JSON.stringify(client),
  });
}

export async function deleteClient(id: string): Promise<void> {
  await request<void>(`/admin/clients/${encodeURIComponent(id)}`, { method: 'DELETE' });
  removeClientDraft(id);
}

export function getClientDraft(key: string): ClientDraft | undefined {
  try {
    const drafts = JSON.parse(localStorage.getItem(draftStorageKey) ?? '{}') as Record<string, ClientDraft>;
    return drafts[key];
  } catch {
    return undefined;
  }
}

export function saveClientDraft(key: string, draft: ClientDraft): void {
  let drafts: Record<string, ClientDraft> = {};
  try {
    drafts = JSON.parse(localStorage.getItem(draftStorageKey) ?? '{}') as Record<string, ClientDraft>;
  } catch {
    drafts = {};
  }
  drafts[key] = draft;
  localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
}

export function removeClientDraft(key: string): void {
  let drafts: Record<string, ClientDraft> = {};
  try {
    drafts = JSON.parse(localStorage.getItem(draftStorageKey) ?? '{}') as Record<string, ClientDraft>;
  } catch {
    drafts = {};
  }
  delete drafts[key];
  localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
}

export type CustomerOrderStatus = 
  | 'NEW' 
  | 'ACCEPTED' 
  | 'PREPARING' 
  | 'IN_PROGRESS' 
  | 'READY' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface CustomerOrder {
  id: string;
  orderType?: 'DINE_IN' | 'DELIVERY';
  tableNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  deliveryLandmark?: string | null;
  deliveryCity?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  estimatedTimeMinutes?: number | null;
  estimatedDeliveryTime?: string | null;
  trackingToken?: string;
  idempotencyKey?: string;
  items: Array<{ id: string; name: string; quantity: number; price: number; variant?: string }>;
  total: number;
  status: CustomerOrderStatus;
  time: string;
  restaurantName?: string;
  restaurantPhone?: string;
  sessionId?: string | null;
  roundNumber?: number;
  parentOrderId?: string | null;
  previousRoundItems?: Array<{ id: string; name: string; quantity: number; price: number; variant?: string; roundNumber?: number }>;
  sessionTotal?: number;
}

export type CreateCustomerOrderPayload = {
  orderType?: 'DINE_IN' | 'DELIVERY';
  tableNumber?: string | null;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string | null;
  deliveryLandmark?: string | null;
  deliveryCity?: string | null;
  notes?: string | null;
  idempotencyKey?: string;
  items: Array<{ id: string; name?: string; quantity: number; price?: number; variant?: string; variantId?: string }>;
  total?: number;
  sessionId?: string | null;
  roundNumber?: number;
  parentOrderId?: string | null;
};

export async function submitCustomerOrder(slug: string, order: CreateCustomerOrderPayload): Promise<CustomerOrder> {
  return request<CustomerOrder>(`/public/menus/${encodeURIComponent(slug)}/orders`, {
    method: 'POST',
    body: JSON.stringify(order)
  });
}

export async function getLiveOrders(): Promise<CustomerOrder[]> {
  return request<CustomerOrder[]>('/app/orders');
}

export async function updateOrderStatus(id: string, status: CustomerOrderStatus, rejectionReason?: string): Promise<CustomerOrder> {
  return request<CustomerOrder>(`/app/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejectionReason })
  });
}

export async function submitCustomerOrderByQr(qrId: string, order: CreateCustomerOrderPayload): Promise<CustomerOrder> {
  return request<CustomerOrder>(`/public/qr/${encodeURIComponent(qrId)}/orders`, {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export async function getCustomerOrderStatus(orderId: string, token?: string): Promise<CustomerOrder> {
  const query = token ? `?token=${encodeURIComponent(token)}` : '';
  return request<CustomerOrder>(`/public/orders/${encodeURIComponent(orderId)}${query}`);
}

export interface AdminStickerRequest {
  id: string;
  tenantId: string;
  restaurantName: string;
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
  updatedAt: string;
}

export function getAdminStickerRequests(): Promise<AdminStickerRequest[]> {
  return request<AdminStickerRequest[]>('/admin/sticker-requests');
}

export function updateAdminStickerRequest(id: string, status: AdminStickerRequest['status'], note?: string): Promise<{ id: string; status: AdminStickerRequest['status']; updatedAt: string }> {
  return request<{ id: string; status: AdminStickerRequest['status']; updatedAt: string }>(`/admin/sticker-requests/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}

export interface AdminCoupon {
  id: string;
  code: string;
  plan_id: string;
  discount_pct: number;
  status: 'AVAILABLE' | 'RESERVED' | 'REDEEMED' | 'EXPIRED' | 'DISABLED';
  created_by: string;
  expires_at: string | null;
  reserved_order_id: string | null;
  reserved_at: string | null;
  redeemed_order_id: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export interface AdminCouponsResponse {
  coupons: AdminCoupon[];
  activeCounts: { INTERMEDIATE: number; PREMIUM: number };
}

export interface BulkGenerateCouponsInput {
  planId: 'INTERMEDIATE' | 'PREMIUM';
  discountPct: number;
  count: number;
  expiryDays?: number | null;
}

export interface BulkGenerateCouponsResponse {
  success: boolean;
  createdCount: number;
  coupons: AdminCoupon[];
}

export interface DisableCouponResponse {
  success: boolean;
  coupon: AdminCoupon;
}

export function getAdminCoupons(filters?: {
  planId?: string;
  status?: string;
  search?: string;
}): Promise<AdminCouponsResponse> {
  const params = new URLSearchParams();
  if (filters?.planId) params.set('planId', filters.planId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  const qs = params.toString();
  return request<AdminCouponsResponse>(`/admin/coupons${qs ? `?${qs}` : ''}`);
}

export function bulkGenerateAdminCoupons(
  payload: BulkGenerateCouponsInput
): Promise<BulkGenerateCouponsResponse> {
  return request<BulkGenerateCouponsResponse>('/admin/coupons/bulk-generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function disableAdminCoupon(id: string): Promise<DisableCouponResponse> {
  return request<DisableCouponResponse>(`/admin/coupons/${encodeURIComponent(id)}/disable`, {
    method: 'PATCH',
  });
}