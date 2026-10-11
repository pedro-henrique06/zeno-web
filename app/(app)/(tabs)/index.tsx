import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Card, Empty, ErrorState, Icon, Loading, Money, Screen, Segmented, Txt } from '@/ui';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { BalanceChart } from '@/components/BalanceChart';
import { useBalances } from '@/hooks/useBalances';
import { useEntries } from '@/hooks/useEntries';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import type { BalanceDay, Entry } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

const dayNet = (d: BalanceDay) => d.entrada - d.saida - d.diario - d.economia - d.cartao;
const daySpending = (d: BalanceDay) => d.saida + d.cartao + d.diario;

function Header({
  days,
  selected,
  month,
  year,
  currency,
  language,
}: {
  days: BalanceDay[];
  selected: BalanceDay | null;
  month: number;
  year: number;
  currency?: any;
  language?: any;
}) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const current = days.find((d) => d.isToday) ?? [...days].reverse().find((d) => !d.isProjected) ?? days[0];
  // While the chart is being scrubbed the headline becomes that day's balance, like the iPhone Stocks app.
  const shown = selected ?? current;
  const balance = shown?.balance ?? 0;
  const label = selected
    ? t('balances.balanceOn', {
        date: new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long' }).format(new Date(year, month - 1, selected.day)),
      })
    : t('balances.currentBalance');
  return (
    <View style={{ marginTop: 8, marginBottom: 8 }} accessibilityLiveRegion="polite">
      <Txt variant="small" muted style={{ fontWeight: '500' }}>
        {label}
      </Txt>
      <Money style={{ fontSize: 46, letterSpacing: -1.8, marginTop: 2, color: balance < 0 ? colors.expense : colors.text }}>
        {balance < 0 ? '−' : ''}
        {formatCurrency(Math.abs(balance), currency, language)}
      </Money>
    </View>
  );
}

/** One card, three columns divided by hairlines: the month at a glance. */
function Stats({ days, currency, language }: { days: BalanceDay[]; currency?: any; language?: any }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const money = (v: number) => formatCurrency(v, currency, language);
  const income = days.reduce((s, d) => s + d.entrada, 0);
  const expenses = days.reduce((s, d) => s + daySpending(d), 0);
  const saved = days.reduce((s, d) => s + d.economia, 0);
  const forecast = days.length ? days[days.length - 1].balance : 0;
  // Balances are cumulative, so what came from earlier months is the first day's balance minus its own movements.
  const carriedOver = days.length ? days[0].balance - dayNet(days[0]) : 0;
  const items = [
    { label: t('balances.statsIncome'), value: income, color: colors.income },
    { label: t('balances.statsExpenses'), value: expenses, color: colors.expense },
    { label: t('balances.statsForecast'), value: forecast, color: forecast >= 0 ? colors.text : colors.expense },
  ];
  // Spell out the terms the three columns leave out, so carried over + income − spending − saved = forecast.
  const extras = [
    Math.abs(carriedOver) >= 0.005 && t('balances.carriedOver', { value: money(carriedOver) }),
    saved > 0 && t('balances.savedThisMonth', { value: money(saved) }),
  ].filter(Boolean);
  return (
    <View style={{ marginTop: 20 }}>
      <Card style={{ flexDirection: 'row', paddingHorizontal: 0, paddingVertical: 14 }}>
        {items.map((s, i) => (
          <View key={s.label} style={[{ flex: 1, paddingHorizontal: 12 }, i > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.divider }]}>
            <Txt variant="caption" muted numberOfLines={1} adjustsFontSizeToFit>
              {s.label}
            </Txt>
            <Money style={{ fontSize: 17, color: s.color, marginTop: 3 }} numberOfLines={1} adjustsFontSizeToFit>
              {money(s.value)}
            </Money>
          </View>
        ))}
      </Card>
      {extras.length > 0 && (
        <Txt variant="caption" muted style={{ marginTop: 7, marginHorizontal: 16 }}>
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
    <Card style={{ paddingHorizontal: 8 }}>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {WEEKDAYS.map((d, i) => (
          <Txt key={i} variant="caption" muted style={{ flex: 1, textAlign: 'center', fontWeight: '600' }}>
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
                style={({ pressed }) => ({
                  flex: 1,
                  aspectRatio: 1,
                  margin: 2,
                  borderRadius: 100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isToday ? brand.blueAction : pressed ? colors.hover : 'transparent',
                })}
              >
                <Txt variant="body" color={isToday ? '#fff' : projected ? colors.textSecondary : colors.text} style={{ fontWeight: isToday ? '600' : '400' }}>
                  {day}
                </Txt>
                <View style={{ flexDirection: 'row', gap: 3, position: 'absolute', bottom: 3 }}>
                  {hasIncome && <Dot color={isToday ? '#fff' : colors.income} size={5} />}
                  {hasExpense && <Dot color={isToday ? '#fff' : colors.expense} size={5} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
        {[
          { color: colors.income, label: t('balances.legendIncome') },
          { color: colors.expense, label: t('balances.legendExpense') },
        ].map((l) => (
          <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Dot color={l.color} size={7} />
            <Txt variant="caption" muted>
              {l.label}
            </Txt>
          </View>
        ))}
      </View>
    </Card>
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
  month,
  year,
  entriesByDay,
  currency,
  language,
  onDay,
}: {
  days: BalanceDay[];
  month: number;
  year: number;
  entriesByDay: Map<number, Entry[]>;
  currency?: any;
  language?: any;
  onDay: (day: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const money = (v: number) => formatCurrency(v, currency, language);
  const weekday = (day: number) => new Intl.DateTimeFormat(i18n.language, { weekday: 'long' }).format(new Date(year, month - 1, day));
  const shown = days.filter((d) => d.entrada + d.saida + d.diario + d.cartao + d.economia > 0 || d.isToday);
  if (shown.length === 0) return <Empty icon="receipt-outline" sf="list.bullet.rectangle" title={t('entries.emptyTitle')} subtitle={t('entries.emptySubtitle')} />;
  return (
    <View style={[styles.group, { backgroundColor: colors.paper }]}>
      {shown.map((d, i) => {
        const expense = daySpending(d);
        const summary = daySummary(entriesByDay.get(d.day), (count) => t('balances.andMore', { count }));
        const last = i === shown.length - 1;
        return (
          <Pressable
            key={d.day}
            accessibilityRole="button"
            accessibilityLabel={[t('balances.dayA11y', { day: d.day, balance: money(d.balance) }), summary].filter(Boolean).join('. ')}
            onPress={() => onDay(d.day)}
            style={({ pressed }) => [styles.dayRow, { opacity: d.isProjected ? 0.55 : 1 }, pressed && { backgroundColor: colors.hover }]}
          >
            {/* Calendar-style date chip, like the Wallet and Calendar apps. */}
            <View style={[styles.dayChip, { backgroundColor: d.isToday ? brand.blueAction : colors.fill }]}>
              <Txt variant="caption" color={d.isToday ? '#fff' : colors.text} style={{ fontWeight: '700', fontSize: 15 }}>
                {d.day}
              </Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt numberOfLines={1} style={{ textTransform: summary ? 'none' : 'capitalize' }}>
                {summary || weekday(d.day)}
              </Txt>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 1 }}>
                {d.entrada > 0 && (
                  <Txt variant="caption" color={colors.income} style={{ fontWeight: '600' }}>
                    +{money(d.entrada)}
                  </Txt>
                )}
                {expense > 0 && (
                  <Txt variant="caption" color={colors.expense} style={{ fontWeight: '600' }}>
                    −{money(expense)}
                  </Txt>
                )}
                {d.economia > 0 && (
                  <Txt variant="caption" color={colors.teal} style={{ fontWeight: '600' }}>
                    −{money(d.economia)}
                  </Txt>
                )}
              </View>
            </View>
            <Money style={{ fontSize: 16, color: d.balance >= 0 ? colors.text : colors.expense }}>{money(d.balance)}</Money>
            <Icon sf="chevron.right" ion="chevron-forward" size={12} color={colors.textDisabled} />
            {!last && <View style={[styles.separator, { backgroundColor: colors.divider }]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function BalancesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [view, setView] = useState<'lista' | 'calendario'>('lista');
  const [scrubbed, setScrubbed] = useState<BalanceDay | null>(null);

  const { data: profile } = useProfile();
  const { data, isLoading, isError, refetch, isRefetching } = useBalances(month, year);
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

  const goToDay = (day: number) => {
    const date = dayjs(new Date(year, month - 1, day)).format('YYYY-MM-DD');
    router.navigate({ pathname: '/entries', params: { month: String(month), year: String(year), date } });
  };

  const days = data?.days ?? [];

  return (
    <Screen
      title={t('appLayout.balances')}
      headerRight={<MonthSwitcher compact month={month} year={year} onChange={(m, y) => (setMonth(m), setYear(y), setScrubbed(null))} />}
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState message={t('balances.loadError')} onRetry={refetch} />
      ) : (
        <>
          {days.length > 0 && (
            <>
              <Header days={days} selected={scrubbed} month={month} year={year} currency={profile?.currency} language={profile?.language} />
              <BalanceChart days={days} month={month} year={year} currency={profile?.currency} language={profile?.language} onSelect={setScrubbed} />
              <Stats days={days} currency={profile?.currency} language={profile?.language} />
            </>
          )}
          <View style={{ marginTop: 24, marginBottom: 12 }}>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: 'lista', label: 'Lista' },
                { value: 'calendario', label: 'Calendário' },
              ]}
            />
          </View>
          {view === 'calendario' ? (
            <Calendar days={days} month={month} year={year} currency={profile?.currency} language={profile?.language} onDay={goToDay} />
          ) : (
            <DayList days={days} month={month} year={year} entriesByDay={entriesByDay} currency={profile?.currency} language={profile?.language} onDay={goToDay} />
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: 22, borderCurve: 'continuous', overflow: 'hidden' },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 14, minHeight: 60 },
  dayChip: { width: 38, height: 38, borderRadius: 11, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  separator: { position: 'absolute', left: 64, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
});
