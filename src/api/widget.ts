import apiClient, { unwrap } from './client';
import type { Currency, Language } from '@/types';

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

export interface WidgetSummary {
  currency: Currency;
  language: Language;
  month: number;
  year: number;
  monthBalance: number;
  income: number;
  expenses: number;
  dailyBudget: number;
  spentToday: number;
  /** dailyBudget - spentToday; negative when over the limit. */
  availableToday: number;
  goal: { name: string; progressPercent: number; savedAmount: number; targetAmount: number } | null;
  generatedAtUtc: string;
}

/** Summary for the native home-screen widgets, for the signed-in user. */
export async function getMyWidgetSummary(timeZone: string): Promise<WidgetSummary> {
  return unwrap(apiClient.get('/widget/summary/me', { params: { tz: timeZone } }));
}
