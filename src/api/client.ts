import axios, { type AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import type { ApiResponse, AuthResponse } from '@/types';
import { session } from '@/lib/session';

const AUTH_ENDPOINTS_WITHOUT_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh-token'];

export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? '';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const stored = session.refreshToken;
  if (!stored) {
    throw new Error('Sem refresh token disponível.');
  }
  const response = await apiClient.post<AuthResponse>('/auth/refresh-token', { refreshToken: stored });
  await session.save(response.data.token, response.data.refreshToken);
  return response.data.token;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const canRetryWithRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !AUTH_ENDPOINTS_WITHOUT_REFRESH.includes(originalRequest.url);

    if (!canRetryWithRefresh) {
      if (status === 401 && !AUTH_ENDPOINTS_WITHOUT_REFRESH.includes(originalRequest?.url)) {
        session.notifySessionLost();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch {
      session.notifySessionLost();
      return Promise.reject(error);
    }
  },
);

export async function unwrap<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const response = await promise;
  return response.data.data;
}

export default apiClient;
