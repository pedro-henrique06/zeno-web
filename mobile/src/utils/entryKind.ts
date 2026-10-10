import { useTranslation } from 'react-i18next';
import { EntryKind } from '@/types';
import type { SFSymbol } from 'expo-symbols';
import type { IonName } from '@/ui/Icon';
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

/** SF Symbol (iOS) and Ionicons twin for each kind, shown in a tinted circle like Wallet transactions. */
export const EntryKindIcons: Record<EntryKind, { sf: SFSymbol; ion: IonName }> = {
  [EntryKind.Entrada]: { sf: 'arrow.down.left', ion: 'arrow-down' },
  [EntryKind.Saida]: { sf: 'doc.text.fill', ion: 'document-text' },
  [EntryKind.Diario]: { sf: 'cart.fill', ion: 'cart' },
  [EntryKind.Economia]: { sf: 'banknote.fill', ion: 'cash' },
  [EntryKind.Cartao]: { sf: 'creditcard.fill', ion: 'card' },
};
