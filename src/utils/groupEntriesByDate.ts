import type { Entry } from '@/types';

export interface EntryDateGroup {
  key: string;
  label: string;
  entries: Entry[];
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function groupEntriesByDate(entries: Entry[]): EntryDateGroup[] {
  const today = dateKey(new Date());
  const yesterday = dateKey(new Date(Date.now() - 86400000));

  const groups = new Map<string, Entry[]>();
  for (const entry of entries) {
    const d = new Date(entry.date);
    const key = isNaN(d.getTime()) ? entry.date : dateKey(d);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }

  const formatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' });

  return Array.from(groups.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, groupEntries]) => {
      let label: string;
      if (key === today) label = 'Hoje';
      else if (key === yesterday) label = 'Ontem';
      else {
        const d = new Date(key);
        label = isNaN(d.getTime()) ? key : formatter.format(d);
      }
      return { key, label, entries: groupEntries };
    });
}
