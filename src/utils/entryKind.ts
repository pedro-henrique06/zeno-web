import { useTranslation } from 'react-i18next';
import { EntryKind } from '@/types';
import { brand } from '@/theme/tokens';

export const EntryKindColors: Record<EntryKind, string> = {
  [EntryKind.Entrada]: brand.income,
  [EntryKind.Saida]: brand.expense,
  [EntryKind.Diario]: brand.warning,
  [EntryKind.Economia]: brand.teal,
  [EntryKind.Cartao]: brand.purple,
};

export const EntryKindLetters: Record<EntryKind, string> = {
  [EntryKind.Entrada]: 'E',
  [EntryKind.Saida]: 'S',
  [EntryKind.Diario]: 'D',
  [EntryKind.Economia]: 'E',
  [EntryKind.Cartao]: 'C',
};

export function useEntryKindLabels(): Record<EntryKind, string> {
  const { t } = useTranslation();
  return {
    [EntryKind.Entrada]: t('entryKind.entrada'),
    [EntryKind.Saida]: t('entryKind.saida'),
    [EntryKind.Diario]: t('entryKind.diario'),
    [EntryKind.Economia]: t('entryKind.economia'),
    [EntryKind.Cartao]: t('entryKind.cartao'),
  };
}

export function isCredit(kind: EntryKind): boolean {
  return kind === EntryKind.Entrada;
}
