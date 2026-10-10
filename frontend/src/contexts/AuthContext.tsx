import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setCsrfToken, getCsrfToken } from '../utils/csrf';

type User = {
  id: string;
  role: 'SUPER_ADMIN' | 'RESTAURANT_OWNER';
  tenantId?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
      const response = await fetch(`${apiBaseUrl}/api/auth/session`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
        if (data.authenticated) {
          setUser(data.user || { id: 'super-admin', role: 'SUPER_ADMIN' });
        } else {
          setUser(null);
        }
      }
    } catch (e) {
      console.error('Failed to verify auth session', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
      const csrfToken = getCsrfToken();
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
      });
      setCsrfToken(null);
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
