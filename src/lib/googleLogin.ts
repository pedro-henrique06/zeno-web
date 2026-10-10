import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_URL } from '@/api/client';

export type GoogleLoginResult = { ok: true; token: string; refreshToken?: string } | { ok: false; cancelled: boolean };

/**
 * Opens the backend's Google flow in the system browser. The server sends the result back to
 * zeno://auth/callback?token=...&refreshToken=..., which closes the browser and returns here.
 */
export async function loginWithGoogle(): Promise<GoogleLoginResult> {
  if (Platform.OS === 'web') {
    // The server sends the browser back to <site>/auth/callback?token=..., handled by app/auth/callback.tsx.
    globalThis.location.assign(`${API_URL}/auth/oauth/google`);
    return { ok: false, cancelled: true };
  }
  const result = await WebBrowser.openAuthSessionAsync(`${API_URL}/auth/oauth/google?app=1`, 'zeno://auth/callback');
  if (result.type !== 'success') return { ok: false, cancelled: true };

  const { queryParams } = Linking.parse(result.url);
  const token = typeof queryParams?.token === 'string' ? queryParams.token : null;
  const refreshToken = typeof queryParams?.refreshToken === 'string' ? queryParams.refreshToken : undefined;
  return token ? { ok: true, token, refreshToken } : { ok: false, cancelled: false };
}
