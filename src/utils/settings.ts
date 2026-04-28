const LOCALE_STORAGE_KEY = 'zeno-locale';

export const LOCALE_MAP: Record<string, string> = {
  BRL: 'pt-BR',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  ARS: 'es-AR',
  MXN: 'es-MX',
  CLP: 'es-CL',
  COP: 'es-CO',
  PEN: 'es-PE',
};

function getStoredLocale(): string {
  if (typeof window === 'undefined') return 'pt-BR';
  return localStorage.getItem(LOCALE_STORAGE_KEY) || 'pt-BR';
}

export function getCurrentLocale(): string {
  return getStoredLocale();
}

export function setCurrentLocale(locale: string): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function getLocaleFromCurrency(currency: string): string {
  return LOCALE_MAP[currency] ?? 'en-US';
}

export function getLocaleFromLanguage(lang: string): string {
  return lang === 'pt' ? 'pt-BR' : 'en-US';
}

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  const locale = getLocaleFromCurrency(currency);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatDate(date: string | Date, locale?: string): string {
  const dateLocale = locale || getCurrentLocale();
  return new Intl.DateTimeFormat(dateLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date, locale?: string): string {
  const dateLocale = locale || getCurrentLocale();
  return new Intl.DateTimeFormat(dateLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatMonthYear(date: Date, locale?: string): string {
  const dateLocale = locale || getCurrentLocale();
  return new Intl.DateTimeFormat(dateLocale, {
    month: 'long',
    year: 'numeric',
  }).format(date);
}
