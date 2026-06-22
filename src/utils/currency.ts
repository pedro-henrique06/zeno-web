import type { Currency, Language } from '@/types';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
};

export const LANGUAGE_LOCALES: Record<Language, string> = {
  PtBR: 'pt-BR',
  EnUS: 'en-US',
  Es: 'es-ES',
};

export function formatCurrency(value: number, currency: Currency = 'BRL', language: Language = 'PtBR'): string {
  return new Intl.NumberFormat(LANGUAGE_LOCALES[language], {
    style: 'currency',
    currency,
    signDisplay: 'negative',
  }).format(value);
}

export function formatDate(date: string | Date, language: Language = 'PtBR'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat(LANGUAGE_LOCALES[language], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatMonthYear(month: number, year: number, language: Language = 'PtBR'): string {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat(LANGUAGE_LOCALES[language], {
    month: 'short',
    year: '2-digit',
  }).format(date);
}
