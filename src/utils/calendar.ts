/**
 * Generates an iCalendar (.ics) string for a recurring monthly entry.
 * The event repeats on the same day every month with a 2-day VALARM reminder.
 */
export function generateIcsForRecurringEntry(entry: {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD — the day-of-month the recurring entry is due
  recurrenceEndDate?: string | null; // YYYY-MM-DD
  description?: string;
}): string {
  const dtstart = entry.date.replace(/-/g, ''); // YYYYMMDD
  const uid = `zeno-${entry.id}@zeno.app`;
  const now = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

  let rrule = 'RRULE:FREQ=MONTHLY';
  if (entry.recurrenceEndDate) {
    const until = entry.recurrenceEndDate.replace(/-/g, '');
    rrule += `;UNTIL=${until}`;
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zeno//Zeno Finance App//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `SUMMARY:${entry.title}`,
    entry.description ? `DESCRIPTION:${entry.description.replace(/\n/g, '\\n')}` : null,
    rrule,
    'BEGIN:VALARM',
    'TRIGGER:-P2D', // 2 days before
    'ACTION:DISPLAY',
    `DESCRIPTION:Lembrete: ${entry.title} vence em 2 dias`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter((l): l is string => l !== null);

  return lines.join('\r\n');
}
