import apiClient, { unwrap } from './client';

export interface NotificationPreference {
  dailyEnabled: boolean;
  sendHour: number;
  timeZoneId: string;
  lastSentOn: string | null;
  activeDevices: number;
  pushConfigured: boolean;
}

export interface UpdateNotificationPreferenceRequest {
  dailyEnabled: boolean;
  sendHour: number;
  timeZoneId: string;
}

export interface SendTestResponse {
  pushConfigured: boolean;
  devicesTargeted: number;
  successCount: number;
  invalidTokensRemoved: number;
  message: string;
}

/** DevicePlatform on the server: Ios = 0, Android = 1, Web = 2. */
export type DevicePlatform = 0 | 1 | 2;

export async function registerDevice(token: string, platform: DevicePlatform): Promise<void> {
  await apiClient.post('/notifications/devices', { token, platform });
}

export async function unregisterDevice(token: string): Promise<void> {
  await apiClient.delete(`/notifications/devices/${encodeURIComponent(token)}`);
}

export async function getPreference(): Promise<NotificationPreference> {
  return unwrap(apiClient.get('/notifications/preferences'));
}

export async function updatePreference(data: UpdateNotificationPreferenceRequest): Promise<NotificationPreference> {
  return unwrap(apiClient.put('/notifications/preferences', data));
}

export async function sendTest(): Promise<SendTestResponse> {
  return unwrap(apiClient.post('/notifications/test'));
}
