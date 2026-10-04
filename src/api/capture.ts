import apiClient, { unwrap } from './client';

export interface CaptureKeyStatus {
  enabled: boolean;
  createdAt: string | null;
}

export interface CaptureKeyCreated {
  /** Plain key, returned only once. */
  key: string;
  createdAt: string;
}

export async function getCaptureKeyStatus(): Promise<CaptureKeyStatus> {
  return unwrap(apiClient.get('/capture/key'));
}

export async function createCaptureKey(): Promise<CaptureKeyCreated> {
  return unwrap(apiClient.post('/capture/key'));
}

export async function revokeCaptureKey(): Promise<void> {
  await apiClient.delete('/capture/key');
}
