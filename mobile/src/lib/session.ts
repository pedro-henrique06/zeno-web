import * as SecureStore from 'expo-secure-store';

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
    try {
      token = await SecureStore.getItemAsync(TOKEN_KEY);
      refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    } catch {
      token = null;
      refreshToken = null;
    }
    return token;
  },

  async save(newToken: string, newRefreshToken?: string): Promise<void> {
    token = newToken;
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    if (newRefreshToken) {
      refreshToken = newRefreshToken;
      await SecureStore.setItemAsync(REFRESH_KEY, newRefreshToken);
    }
  },

  async clear(): Promise<void> {
    token = null;
    refreshToken = null;
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_KEY);
    } catch {
      // nothing to clean
    }
  },

  /** Registered by the AuthProvider: called when the API says the session is gone for good. */
  setSessionLostHandler(handler: (() => void) | null) {
    onSessionLost = handler;
  },

  notifySessionLost() {
    onSessionLost?.();
  },
};
