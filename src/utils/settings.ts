const LOCALE_STORAGE_KEY = 'locale';

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
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved === 'pt') return 'pt-BR';
  if (saved === 'en') return 'en-US';
  return saved || 'pt-BR';
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
  const locale = 'pt-BR';
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
  if (value < 0) {
    return formatted.replace('-', '-R$').replace('R$', '-R$');
  }
  return formatted;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}
