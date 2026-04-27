import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user?: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwtPayload(token: string): User {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
  const payload = JSON.parse(jsonPayload);
  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    createdAt: '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        return parseJwtPayload(token);
      } catch {
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token'),
  );

  const loginFn = useCallback((newToken: string, newUser?: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser ?? parseJwtPayload(newToken));
  }, []);

  const logoutFn = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      try {
        setUser(parseJwtPayload(token));
      } catch {
        logoutFn();
      }
    }
  }, [token, logoutFn]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login: loginFn,
        logout: logoutFn,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
