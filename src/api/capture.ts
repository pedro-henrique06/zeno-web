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

export interface CaptureRule {
  id: string;
  match: string;
  tagId: string;
}

export async function getCaptureRules(): Promise<CaptureRule[]> {
  return unwrap(apiClient.get('/capture/rules'));
}

export async function addCaptureRule(data: { match: string; tagId: string }): Promise<CaptureRule> {
  return unwrap(apiClient.post('/capture/rules', data));
}

export async function deleteCaptureRule(id: string): Promise<void> {
  await apiClient.delete(`/capture/rules/${id}`);
}

/** A Wallet card seen in Apple Pay captures. type: "credit", "debit", or null until classified. */
export interface CaptureCard {
  id: string;
  name: string;
  type: 'credit' | 'debit' | null;
  purchaseCount: number;
  lastSeenAt: string;
}

export async function getCaptureCards(): Promise<CaptureCard[]> {
  return unwrap(apiClient.get('/capture/cards'));
}

export async function classifyCaptureCard(data: {
  id: string;
  type: 'credit' | 'debit';
  applyToPast: boolean;
}): Promise<{ card: CaptureCard; updatedEntries: number }> {
  return unwrap(apiClient.put(`/capture/cards/${data.id}`, { type: data.type, applyToPast: data.applyToPast }));
}
