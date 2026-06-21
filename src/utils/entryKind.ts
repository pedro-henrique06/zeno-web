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

export const EntryKindLabels: Record<EntryKind, string> = {
  [EntryKind.Entrada]: 'Entrada',
  [EntryKind.Saida]: 'Saída',
  [EntryKind.Diario]: 'Diário',
  [EntryKind.Economia]: 'Economia',
  [EntryKind.Cartao]: 'Gasto com cartão',
};

export function isCredit(kind: EntryKind): boolean {
  return kind === EntryKind.Entrada;
}
