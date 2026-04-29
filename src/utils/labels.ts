import { translations } from '@/i18n/translations';
import type { Category, SplitMode, HomeRole, EntryType } from '@/types';

type Locale = 'en' | 'pt';

function getLocale(): Locale {
  if (typeof window === 'undefined') return 'pt';
  const saved = localStorage.getItem('locale');
  return (saved === 'pt' || saved === 'en') ? saved : 'pt';
}

function getNestedValue(obj: unknown, path: string): string {
  const parts = path.split('.');
  let value: unknown = obj;
  for (const k of parts) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return path;
    }
  }
  return typeof value === 'string' ? value : path;
}

export function getCategoryLabel(category: Category): string {
  const locale = getLocale();
  const keyMap: Record<Category, string> = {
    [0]: 'none',
    [1]: 'restaurant',
    [2]: 'grocery',
    [3]: 'entertainment',
    [4]: 'utilities',
    [5]: 'transportation',
    [6]: 'health',
    [7]: 'education',
    [8]: 'shopping',
    [9]: 'housing',
    [10]: 'salary',
    [11]: 'gift',
    [12]: 'investment',
    [13]: 'other',
  };
  const key = keyMap[category] ?? 'other';
  return getNestedValue(translations[locale].category, key);
}

export function getSplitModeLabel(splitMode: SplitMode): string {
  const locale = getLocale();
  const keyMap: Record<SplitMode, string> = {
    [0]: 'byTotalBalance',
    [1]: 'byIndividualAccounts',
  };
  const key = keyMap[splitMode] ?? 'byTotalBalance';
  return getNestedValue(translations[locale].home, key);
}

export function getHomeRoleLabel(role: HomeRole): string {
  const locale = getLocale();
  const keyMap: Record<HomeRole, string> = {
    [0]: 'admin',
    [1]: 'member',
  };
  const key = keyMap[role] ?? 'member';
  return getNestedValue(translations[locale].home, key);
}

export function getEntryTypeLabel(type: EntryType): string {
  const locale = getLocale();
  const key = type === 0 ? 'credit' : 'debit';
  return getNestedValue(translations[locale].common, key);
}
