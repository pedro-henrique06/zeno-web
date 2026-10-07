import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import type { Language } from '@/types';
import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';

export const LANGUAGE_TO_I18N: Record<Language, string> = {
  PtBR: 'pt',
  EnUS: 'en',
  Es: 'es',
};

function deviceLanguage(): string {
  const code = getLocales()[0]?.languageCode;
  return code === 'en' || code === 'es' ? code : 'pt';
}

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    es: { translation: es },
  },
  lng: deviceLanguage(),
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
});

export default i18n;
