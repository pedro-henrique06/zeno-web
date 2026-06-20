import { Category, EntryType, type Entry } from '@/types';

export type EntryKind = 'entrada' | 'saida' | 'diario' | 'economia' | 'cartao';

export const EntryKindColors: Record<EntryKind, string> = {
  entrada: '#22C55E',
  saida: '#F97316',
  diario: '#EC4899',
  economia: '#14B8A6',
  cartao: '#8B5CF6',
};

export const EntryKindLetters: Record<EntryKind, string> = {
  entrada: 'E',
  saida: 'S',
  diario: 'D',
  economia: 'E',
  cartao: 'C',
};

/**
 * The backend only models Credit/Debit + a flat Category, not the 5-way
 * kind taxonomy of the reference design. Until the API exposes a real
 * `kind`/tag field, this heuristic buckets existing data: Utilities and
 * Transportation are treated as fixed "Saída" costs, while
 * Restaurant/Grocery/Entertainment count as variable day-to-day "Diário"
 * spend. Economia and Cartão have no backing category yet, so they report
 * zero until the backend adds them (see docs/BACKEND_REQUIREMENTS.md).
 */
export function getEntryKind(entry: Entry): EntryKind {
  if (entry.type === EntryType.Credit) return 'entrada';

  switch (entry.category) {
    case Category.Utilities:
    case Category.Transportation:
      return 'saida';
    case Category.Restaurant:
    case Category.Grocery:
    case Category.Entertainment:
      return 'diario';
    default:
      return 'saida';
  }
}
