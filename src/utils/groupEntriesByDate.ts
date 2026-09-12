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
    // Extract YYYY-MM-DD directly to avoid UTC→local day shift
    // e.g. "2026-09-12T00:00:00Z" in UTC-3 would otherwise key as "2026-09-11"
    const key = entry.date.length >= 10 ? entry.date.substring(0, 10) : entry.date;
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
        // Parse YYYY-MM-DD as local date (avoid new Date("YYYY-MM-DD") UTC midnight shift)
        const parts = key.split('-').map(Number);
        const d = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(key);
        label = isNaN(d.getTime()) ? key : formatter.format(d);
      }
      return { key, label, entries: groupEntries };
    });
}
