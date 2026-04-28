import { useState, useEffect } from 'react';

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
  window.dispatchEvent(new Event('zeno-locale-change'));
}

export function useLocale() {
  const [locale, setLocale] = useState(getStoredLocale);

  useEffect(() => {
    const handleChange = () => setLocale(getStoredLocale());
    window.addEventListener('zeno-locale-change', handleChange);
    return () => window.removeEventListener('zeno-locale-change', handleChange);
  }, []);

  const setLocaleWithSync = (newLocale: string) => {
    setCurrentLocale(newLocale);
    setLocale(newLocale);
  };

  const getLocaleFromCurrency = (currency: string): string => {
    return LOCALE_MAP[currency] ?? 'en-US';
  };

  return {
    locale,
    setLocale: setLocaleWithSync,
    getLocaleFromCurrency,
  };
}
