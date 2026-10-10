import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Card, Empty, Fab, Loading, Money, Screen, Segmented, Txt, ErrorState } from '@/ui';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { BalanceChart, type ChartPoint } from '@/components/BalanceChart';
import { EntryFormSheet } from '@/components/EntryFormSheet';
import { useBalances, useBalancesHorizon } from '@/hooks/useBalances';
import { useEntries } from '@/hooks/useEntries';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import type { BalanceDay, Entry } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

const dayNet = (d: BalanceDay) => d.entrada - d.saida - d.diario - d.economia - d.cartao;
const daySpending = (d: BalanceDay) => d.saida + d.cartao + d.diario;

function Header({ days, currency, language }: { days: BalanceDay[]; currency?: any; language?: any }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const current = days.find((d) => d.isToday) ?? [...days].reverse().find((d) => !d.isProjected) ?? days[0];
  const balance = current?.balance ?? 0;
  return (
    <View style={{ marginBottom: 12 }}>
      <Txt variant="label" muted>
        {t('balances.currentBalance')}
      </Txt>
      <Money style={{ fontSize: 40, letterSpacing: -1.5, color: balance < 0 ? colors.expense : colors.text }}>
        {balance < 0 ? '−' : ''}
        {formatCurrency(Math.abs(balance), currency, language)}
      </Money>
    </View>
  );
}

function Stats({ days, currency, language }: { days: BalanceDay[]; currency?: any; language?: any }) {
  const { t } = useTranslation();
  const money = (v: number) => formatCurrency(v, currency, language);
  const income = days.reduce((s, d) => s + d.entrada, 0);
  const expenses = days.reduce((s, d) => s + daySpending(d), 0);
  const saved = days.reduce((s, d) => s + d.economia, 0);
  const forecast = days.length ? days[days.length - 1].balance : 0;
  // Balances are cumulative, so what came from earlier months is the first day's balance minus its own movements.
  const carriedOver = days.length ? days[0].balance - dayNet(days[0]) : 0;
  const items = [
    { label: t('balances.statsIncome'), value: income, color: brand.income },
    { label: t('balances.statsExpenses'), value: expenses, color: brand.expense },
    { label: t('balances.statsForecast'), value: forecast, color: forecast >= 0 ? brand.teal : brand.expense },
  ];
  // Spell out the terms the three cards leave out, so carried over + income − spending − saved = forecast.
  const extras = [
    Math.abs(carriedOver) >= 0.005 && t('balances.carriedOver', { value: money(carriedOver) }),
    saved > 0 && t('balances.savedThisMonth', { value: money(saved) }),
  ].filter(Boolean);
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {items.map((s) => (
          <Card key={s.label} dark style={{ flex: 1, padding: 12 }}>
            <Txt variant="label" color="rgba(255,255,255,0.7)" style={{ fontSize: 9, letterSpacing: 0.6, marginBottom: 4 }} numberOfLines={1} adjustsFontSizeToFit>
              {s.label}
            </Txt>
            <Money color={s.color} style={{ fontSize: 14, color: s.color }} numberOfLines={1} adjustsFontSizeToFit>
              {money(s.value)}
            </Money>
          </Card>
        ))}
      </View>
      {extras.length > 0 && (
        <Txt variant="caption" muted style={{ marginTop: 8, textAlign: 'right' }}>
          {extras.join('  ·  ')}
        </Txt>
      )}
    </View>
  );
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function Dot({ color, size = 6 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

function Calendar({
  days,
  month,
  year,
  currency,
  language,
  onDay,
}: {
  days: BalanceDay[];
  month: number;
  year: number;
  currency?: any;
  language?: any;
  onDay: (day: number) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const now = new Date();
  const todayDay = now.getMonth() + 1 === month && now.getFullYear() === year ? now.getDate() : -1;
  const first = new Date(year, month - 1, 1).getDay();
  const total = new Date(year, month, 0).getDate();
  const byDay = new Map(days.map((d) => [d.day, d]));
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {WEEKDAYS.map((d, i) => (
          <Txt key={i} variant="caption" muted style={{ flex: 1, textAlign: 'center' }}>
            {d}
          </Txt>
        ))}
      </View>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((day, c) => {
            if (!day) return <View key={c} style={{ flex: 1, aspectRatio: 1 }} />;
            const info = byDay.get(day);
            const isToday = day === todayDay;
            const projected = info?.isProjected;
            const hasIncome = (info?.entrada ?? 0) > 0;
            const hasExpense = info ? daySpending(info) > 0 : false;
            return (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={t('balances.dayA11y', { day, balance: formatCurrency(info?.balance ?? 0, currency, language) })}
                onPress={() => onDay(day)}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  margin: 1,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isToday ? brand.blueAction : projected ? brand.teal + '1f' : 'transparent',
                }}
              >
                <Txt variant="small" color={isToday ? '#fff' : projected ? colors.teal : colors.text}>
                  {day}
                </Txt>
                <View style={{ flexDirection: 'row', gap: 3, position: 'absolute', bottom: 4 }}>
                  {hasIncome && <Dot color={isToday ? '#fff' : projected ? colors.teal : colors.income} />}
                  {hasExpense && <Dot color={isToday ? '#fff' : projected ? colors.teal : colors.expense} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 10 }}>
        {[
          { color: colors.income, label: t('balances.legendIncome') },
          { color: colors.expense, label: t('balances.legendExpense') },
        ].map((l) => (
          <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Dot color={l.color} size={8} />
            <Txt variant="caption" muted>
              {l.label}
            </Txt>
          </View>
        ))}
        {/* Projected days are tinted cells, so the key is a swatch, not a dot. */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: brand.teal + '1f', borderWidth: 1, borderColor: colors.teal }} />
          <Txt variant="caption" muted>
            {t('balances.legendProjected')}
          </Txt>
        </View>
      </View>
    </View>
  );
}

/** "Salário, Aluguel +2": the largest movements of the day, so the list says what happened, not only how much. */
function daySummary(entries: Entry[] | undefined, more: (n: number) => string): string {
  if (!entries?.length) return '';
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const head = sorted.slice(0, 2).map((e) => e.title);
  return sorted.length > 2 ? `${head.join(', ')} ${more(sorted.length - 2)}` : head.join(', ');
}

function DayList({
  days,
  entriesByDay,
  currency,
  language,
  onDay,
}: {
  days: BalanceDay[];
  entriesByDay: Map<number, Entry[]>;
  currency?: any;
  language?: any;
  onDay: (day: number) => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const money = (v: number) => formatCurrency(v, currency, language);
  const shown = days.filter((d) => d.entrada + d.saida + d.diario + d.cartao + d.economia > 0 || d.isToday);
  if (shown.length === 0) return <Empty icon="receipt-outline" title={t('entries.emptyTitle')} subtitle={t('entries.emptySubtitle')} />;
  return (
    <View>
      {shown.map((d, i) => {
        const expense = daySpending(d);
        const summary = daySummary(entriesByDay.get(d.day), (count) => t('balances.andMore', { count }));
        return (
          <Pressable
            key={d.day}
            accessibilityRole="button"
            accessibilityLabel={[t('balances.dayA11y', { day: d.day, balance: money(d.balance) }), summary].filter(Boolean).join('. ')}
            onPress={() => onDay(d.day)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 11,
              borderTopWidth: i ? 0.5 : 0,
              borderTopColor: colors.divider,
              opacity: d.isProjected ? 0.6 : 1,
            }}
          >
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: d.isToday ? brand.blueAction : colors.hover,
              }}
            >
              <Txt variant="caption" color={d.isToday ? '#fff' : undefined} style={{ fontWeight: '700' }}>
                {d.day}
              </Txt>
            </View>
            <View style={{ flex: 1 }}>
              {summary ? (
                <Txt variant="small" numberOfLines={1}>
                  {summary}
                </Txt>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {d.entrada > 0 && (
                  <Txt variant="caption" color={colors.income} style={{ fontWeight: '700' }}>
                    +{money(d.entrada)}
                  </Txt>
                )}
                {expense > 0 && (
                  <Txt variant="caption" color={colors.expense} style={{ fontWeight: '700' }}>
                    −{money(expense)}
                  </Txt>
                )}
                {d.economia > 0 && (
                  <Txt variant="caption" color={colors.teal} style={{ fontWeight: '700' }}>
                    −{money(d.economia)}
                  </Txt>
                )}
              </View>
            </View>
            <Txt variant="small" color={d.balance >= 0 ? colors.income : colors.expense} style={{ minWidth: 84, textAlign: 'right', fontWeight: '700' }}>
              {money(d.balance)}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function BalancesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [view, setView] = useState<'lista' | 'calendario'>('lista');
  const [sheet, setSheet] = useState<{ open: boolean; date?: string }>({ open: false });

  const { data: profile } = useProfile();
  const { data, isLoading, isError, refetch, isRefetching } = useBalances(month, year);
  const { data: horizon } = useBalancesHorizon(year, true);
  // Same query key as the Entries tab, so this is shared from cache.
  const { data: entries } = useEntries(month, year, 1, 200);

  const entriesByDay = useMemo(() => {
    const map = new Map<number, Entry[]>();
    for (const e of entries?.items ?? []) {
      const day = Number(e.date.substring(8, 10));
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(e);
    }
    return map;
  }, [entries]);

  const chart = useMemo(() => {
    const past: ChartPoint[] = [];
    const future: ChartPoint[] = [];
    let todayX: number | null = null;
    let todayY: number | null = null;
    let bridged = false;
    horizon?.months.forEach((m) =>
      m.days.forEach((d) => {
        const x = new Date(m.year, m.month - 1, d.day).getTime();
        if (d.isToday) {
          todayX = x;
          todayY = d.balance;
        }
        if (!d.isProjected) past.push({ x, y: d.balance });
        else {
          if (!bridged && past.length) {
            future.push(past[past.length - 1]);
            bridged = true;
          }
          future.push({ x, y: d.balance });
        }
      }),
    );
    return { past, future, todayX, todayY };
  }, [horizon]);

  const goToDay = (day: number) => {
    const date = dayjs(new Date(year, month - 1, day)).format('YYYY-MM-DD');
    router.navigate({ pathname: '/entries', params: { month: String(month), year: String(year), date } });
  };

  const days = data?.days ?? [];

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={isRefetching} onRefresh={refetch} withFab>
        <MonthSwitcher month={month} year={year} onChange={(m, y) => (setMonth(m), setYear(y))} />
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <ErrorState message={t('balances.loadError')} onRetry={refetch} />
        ) : (
          <>
            {days.length > 0 && (
              <>
                <Header days={days} currency={profile?.currency} language={profile?.language} />
                {chart.past.length > 1 && (
                  <View style={{ marginBottom: 12 }}>
                    <BalanceChart {...chart} height={150} />
                    {chart.future.length > 1 && (
                      <Txt variant="caption" muted style={{ marginTop: 4 }}>
                        {t('balances.chartHint')}
                      </Txt>
                    )}
                  </View>
                )}
                <Stats days={days} currency={profile?.currency} language={profile?.language} />
              </>
            )}
            <View style={{ marginBottom: 12 }}>
              <Segmented
                value={view}
                onChange={setView}
                options={[
                  { value: 'lista', label: 'Lista' },
                  { value: 'calendario', label: 'Calendário', color: brand.teal },
                ]}
              />
            </View>
            {view === 'calendario' ? (
              <Calendar days={days} month={month} year={year} currency={profile?.currency} language={profile?.language} onDay={goToDay} />
            ) : (
              <DayList days={days} entriesByDay={entriesByDay} currency={profile?.currency} language={profile?.language} onDay={goToDay} />
            )}
          </>
        )}
      </Screen>
      <Fab label={t('entryForm.newTitle')} onPress={() => setSheet({ open: true })} />
      <EntryFormSheet visible={sheet.open} defaultDate={sheet.date} onClose={() => setSheet({ open: false })} />
    </View>
  );
}
