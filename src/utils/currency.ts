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

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  const locale = LOCALE_MAP[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}
