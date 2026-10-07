import { storage } from '@/lib/storage';

const TOKEN_KEY = 'zeno.token';
const REFRESH_KEY = 'zeno.refreshToken';

// The HTTP client needs the token synchronously, so it is mirrored in memory.
let token: string | null = null;
let refreshToken: string | null = null;
let onSessionLost: (() => void) | null = null;

export const session = {
  get token() {
    return token;
  },
  get refreshToken() {
    return refreshToken;
  },

  async load(): Promise<string | null> {
    token = await storage.get(TOKEN_KEY);
    refreshToken = await storage.get(REFRESH_KEY);
    return token;
  },

  async save(newToken: string, newRefreshToken?: string): Promise<void> {
    token = newToken;
    await storage.set(TOKEN_KEY, newToken);
    if (newRefreshToken) {
      refreshToken = newRefreshToken;
      await storage.set(REFRESH_KEY, newRefreshToken);
    }
  },

  async clear(): Promise<void> {
    token = null;
    refreshToken = null;
    await storage.remove(TOKEN_KEY);
    await storage.remove(REFRESH_KEY);
  },

  /** Registered by the AuthProvider: called when the API says the session is gone for good. */
  setSessionLostHandler(handler: (() => void) | null) {
    onSessionLost = handler;
  },

  notifySessionLost() {
    onSessionLost?.();
  },
};
