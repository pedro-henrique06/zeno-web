export {
  LOCALE_MAP,
  getCurrentLocale,
  setCurrentLocale,
  getLocaleFromCurrency,
  getLocaleFromLanguage,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMonthYear,
} from './settings';

export const CURRENCIES = [
  { code: 'BRL', label: 'BRL - Real Brasileiro' },
  { code: 'USD', label: 'USD - Dólar Americano' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - Libra Esterlina' },
  { code: 'JPY', label: 'JPY - Iene Japonês' },
  { code: 'ARS', label: 'ARS - Peso Argentino' },
  { code: 'MXN', label: 'MXN - Peso Mexicano' },
  { code: 'CLP', label: 'CLP - Peso Chileno' },
  { code: 'COP', label: 'COP - Peso Colombiano' },
  { code: 'PEN', label: 'PEN - Sol Peruano' },
] as const;
