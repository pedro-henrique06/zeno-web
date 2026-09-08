import { useTranslation } from 'react-i18next';
import { EntryKind } from '@/types';

export const EntryKindColors: Record<EntryKind, string> = {
  [EntryKind.Entrada]: '#22C55E',
  [EntryKind.Saida]: '#F97316',
  [EntryKind.Diario]: '#EC4899',
  [EntryKind.Economia]: '#14B8A6',
  [EntryKind.Cartao]: '#8B5CF6',
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
