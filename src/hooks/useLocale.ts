import { useState, useEffect } from 'react';

const LOCALE_STORAGE_KEY = 'zeno-locale';

const LOCALE_MAP: Record<string, string> = {
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

function getDefaultLocale(): string {
  if (typeof window === 'undefined') return 'pt-BR';
  return localStorage.getItem(LOCALE_STORAGE_KEY) || 'pt-BR';
}

export function useLocale() {
  const [locale, setLocaleState] = useState(getDefaultLocale);

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && stored !== locale) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (newLocale: string) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
  };

  const getLocaleFromCurrency = (currency: string): string => {
    return LOCALE_MAP[currency] ?? 'en-US';
  };

  return {
    locale,
    setLocale,
    getLocaleFromCurrency,
  };
}

export { LOCALE_MAP };
