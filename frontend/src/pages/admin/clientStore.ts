export type ClientCategory = 'restaurants' | 'dhabas' | 'cafes';
export type MenuDietType = 'veg' | 'non-veg' | 'vegan';

export interface MenuItemRecord {
  id: string;
  name: string;
  description: string;
  price: string;
  pricingType?: 'single' | 'half-full' | 'sizes';
  halfPrice?: string;
  fullPrice?: string;
  regPrice?: string;
  medPrice?: string;
  largePrice?: string;
  category: string;
  dietType: MenuDietType;
  image: string;
  available: boolean;
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
  openingHours: string;
  services: string[];
  heroImage?: string;
  categories?: Array<{ id: string; name: string; order: number }>;
  menuItems: MenuItemRecord[];
  plan?: string;
  templateId?: string;
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

const draftStorageKey = 'menusqr.clientDrafts';
const migrationStorageKey = 'menusqr.apiMigration.v1';


type ClientDraft = Omit<ClientRecord, 'id' | 'createdAt'>;
let migrationPromise: Promise<void> | undefined;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  let csrfHeaders: Record<string, string> = {};
  if (isStateChanging) {
    const token = await ensureCsrfToken();
    if (token) {
      csrfHeaders['X-CSRF-Token'] = token;
    }
  }

  const response = await fetch(`${apiBaseUrl}/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...csrfHeaders,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    if (response.status === 401 && path.startsWith('/admin/')) {
      window.dispatchEvent(new Event('menusqr:admin-unauthorized'));
    }
    const result = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(result?.error ?? `Request failed (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
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
  onboardingState?: string;
}

export async function loginAdmin(password: string, email?: string): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password, email }),
  });
}

export async function verifyLoginOtp(tempToken: string, otp: string): Promise<LoginResponse> {
  const res = await request<LoginResponse & { csrfToken?: string }>('/auth/verify-login-otp', {
    method: 'POST',
    body: JSON.stringify({ tempToken, otp }),
  });
  if (res.csrfToken) setCsrfToken(res.csrfToken);
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
  return res;
}

export async function requestSuperAdminOtp(email: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/auth/admin/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifySuperAdminOtp(email: string, otp: string): Promise<LoginResponse> {
  const res = await request<LoginResponse & { csrfToken?: string }>('/auth/admin/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
  if (res.csrfToken) setCsrfToken(res.csrfToken);
  return res;
}

export async function logoutSuperAdmin(): Promise<AdminSession> {
  const res = await request<AdminSession>('/auth/admin/logout', { method: 'POST', body: '{}' });
  setCsrfToken(null);
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
  };
  plan: string;
  templateId?: string;
  categories: Array<{ id: string; name: string; order: number }>;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    dietType: 'veg' | 'non-veg' | 'vegan';
    available: boolean;
    image?: string;
  }>;
}

function mapPublicMenu(raw: RawPublicMenuApiResponse): PublicMenuRecord {
  const menuItems: MenuItemRecord[] = raw.items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    price: String(item.price),
    pricingType: 'single' as const,
    halfPrice: '',
    fullPrice: '',
    regPrice: '',
    medPrice: '',
    largePrice: '',
    category: item.category,
    dietType: (item.dietType ?? 'veg') as MenuDietType,
    image: item.image ?? '',
    available: item.available,
  }));
  return {
    businessName: raw.restaurant.name,
    tagline: raw.restaurant.tagline ?? '',
    logoUrl: undefined,
    category: (raw.restaurant.category ?? 'restaurants') as ClientCategory,
    phone: raw.restaurant.phone ?? '',
    address: raw.restaurant.address ?? '',
    city: raw.restaurant.city ?? '',
    state: '',
    website: '',
    openingHours: '',
    services: [],
    heroImage: undefined,
    categories: raw.categories,
    menuItems,
    plan: raw.plan,
    templateId: raw.templateId,
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

export interface CustomerOrder {
  id: string;
  tableNumber: string;
  items: Array<{ id: string; name: string; quantity: number; price: number; variant?: string }>;
  total: number;
  status: 'NEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED';
  time: string;
}

export async function submitCustomerOrder(slug: string, order: Omit<CustomerOrder, 'id' | 'status' | 'time'>): Promise<CustomerOrder> {
  return request<CustomerOrder>(`/public/menus/${encodeURIComponent(slug)}/orders`, {
    method: 'POST',
    body: JSON.stringify(order)
  });
}

export async function getLiveOrders(): Promise<CustomerOrder[]> {
  return request<CustomerOrder[]>('/app/orders');
}

export async function updateOrderStatus(id: string, status: CustomerOrder['status']): Promise<CustomerOrder> {
  return request<CustomerOrder>(`/app/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export async function submitCustomerOrderByQr(qrId: string, order: Omit<CustomerOrder, 'id' | 'status' | 'time'>): Promise<CustomerOrder> {
  return request<CustomerOrder>(`/public/qr/${encodeURIComponent(qrId)}/orders`, {
    method: 'POST',
    body: JSON.stringify(order),
  });
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