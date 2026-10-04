import apiClient, { unwrap } from './client';

export interface WidgetKeyStatus {
  enabled: boolean;
  createdAt: string | null;
}

export interface WidgetKeyCreated {
  /** Plain key, returned only once. */
  key: string;
  createdAt: string;
}

export async function getWidgetKeyStatus(): Promise<WidgetKeyStatus> {
  return unwrap(apiClient.get('/widget/key'));
}

export async function createWidgetKey(): Promise<WidgetKeyCreated> {
  return unwrap(apiClient.post('/widget/key'));
}

export async function revokeWidgetKey(): Promise<void> {
  await apiClient.delete('/widget/key');
}
