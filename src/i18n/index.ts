import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Language } from '@/types';
import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';

export const LANGUAGE_TO_I18N: Record<Language, string> = {
  PtBR: 'pt',
  EnUS: 'en',
  Es: 'es',
};

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
    es: { translation: es },
  },
  lng: localStorage.getItem('language') ?? 'pt',
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
});

export default i18n;
