const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/api/app${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
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
  ownerName: string;
  email: string;
  menuSlug: string;
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
}

export interface AppQrData {
  qrCodeUrl?: string;
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

export function getQr(): Promise<AppQrData> {
  return request<AppQrData>('/qr');
}

export function updateSettings(data: any): Promise<any> {
  return request<any>('/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
