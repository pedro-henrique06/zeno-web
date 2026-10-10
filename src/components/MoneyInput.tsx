import { Field } from '@/ui';
import { CURRENCY_SYMBOLS, LANGUAGE_LOCALES } from '@/utils/currency';
import type { Currency, Language } from '@/types';

/** Whole-number money input: keeps only digits and shows them with the locale's grouping. */
export function MoneyInput({
  label,
  value,
  onChange,
  currency = 'BRL',
  language = 'PtBR',
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  currency?: Currency;
  language?: Language;
  placeholder?: string;
}) {
  const shown = value > 0 ? new Intl.NumberFormat(LANGUAGE_LOCALES[language], { maximumFractionDigits: 0 }).format(value) : '';
  return (
    <Field
      label={`${label} (${CURRENCY_SYMBOLS[currency]})`}
      value={shown}
      placeholder={placeholder}
      keyboardType="number-pad"
      onChangeText={(text) => onChange(Math.min(Number(text.replace(/\D/g, '') || '0'), 999_999_999_999))}
    />
  );
}
