import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { session } from '@/lib/session';

interface AuthContextType {
  user: User | null;
  /** false until the stored session was read from the keychain. */
  ready: boolean;
  isAuthenticated: boolean;
  login: (token: string, user?: User, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeBase64(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = input.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const c of clean) {
    value = (value << 6) | chars.indexOf(c);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >> bits) & 0xff);
    }
  }
  return decodeURIComponent(bytes.map((b) => '%' + b.toString(16).padStart(2, '0')).join(''));
}

function parseJwtPayload(token: string): User {
  const payload = JSON.parse(decodeBase64(token.split('.')[1]));
  return { id: payload.sub, name: payload.name, email: payload.email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(async () => {
    await session.clear();
    setUser(null);
  }, []);

  const login = useCallback(async (token: string, newUser?: User, refreshToken?: string) => {
    await session.save(token, refreshToken);
    setUser(newUser ?? parseJwtPayload(token));
  }, []);

  useEffect(() => {
    let cancelled = false;
    session.load().then((token) => {
      if (cancelled) return;
      if (token) {
        try {
          setUser(parseJwtPayload(token));
        } catch {
          session.clear();
        }
      }
      setReady(true);
    });
    session.setSessionLostHandler(() => {
      logout();
    });
    return () => {
      cancelled = true;
      session.setSessionLostHandler(null);
    };
  }, [logout]);

  const value = useMemo(
    () => ({ user, ready, isAuthenticated: !!user, login, logout }),
    [user, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
