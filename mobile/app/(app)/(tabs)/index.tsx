import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, Empty, Loading, Money, Screen, Segmented, Txt } from '@/ui';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { BalanceChart, type ChartPoint } from '@/components/BalanceChart';
import { EntryFormSheet } from '@/components/EntryFormSheet';
import { useBalances, useBalancesHorizon } from '@/hooks/useBalances';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import type { BalanceDay } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

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
      <Money style={{ fontSize: 40, letterSpacing: -1.5, color: balance < 0 ? brand.expense : colors.text }}>
        {balance < 0 ? '−' : ''}
        {formatCurrency(Math.abs(balance), currency, language)}
      </Money>
    </View>
  );
}

function Stats({ days, currency, language }: { days: BalanceDay[]; currency?: any; language?: any }) {
  const { t } = useTranslation();
  const income = days.reduce((s, d) => s + d.entrada, 0);
  const expenses = days.reduce((s, d) => s + d.saida + d.cartao + d.diario, 0);
  const forecast = days.length ? days[days.length - 1].balance : 0;
  const items = [
    { label: t('balances.statsIncome'), value: income, color: brand.income },
    { label: t('balances.statsExpenses'), value: expenses, color: brand.expense },
    { label: t('balances.statsForecast'), value: forecast, color: forecast >= 0 ? brand.teal : brand.expense },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
      {items.map((s) => (
        <Card key={s.label} dark style={{ flex: 1, padding: 12 }}>
          <Txt variant="label" color="rgba(255,255,255,0.45)" style={{ fontSize: 8, marginBottom: 4 }} numberOfLines={1}>
            {s.label}
          </Txt>
          <Money color={s.color} style={{ fontSize: 14, color: s.color }} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(s.value, currency, language)}
          </Money>
        </Card>
      ))}
    </View>
  );
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function Calendar({ days, month, year, onDay }: { days: BalanceDay[]; month: number; year: number; onDay: (day: number) => void }) {
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
            const hasExpense = (info?.saida ?? 0) + (info?.cartao ?? 0) + (info?.diario ?? 0) > 0;
            return (
              <Pressable
                key={c}
                accessibilityRole="button"
                onPress={() => onDay(day)}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  margin: 1,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isToday ? brand.blue : projected ? brand.teal + '1f' : 'transparent',
                }}
              >
                <Txt variant="small" color={isToday ? '#fff' : projected ? brand.teal : colors.text}>
                  {day}
                </Txt>
                <View style={{ flexDirection: 'row', gap: 2, position: 'absolute', bottom: 3 }}>
                  {hasIncome && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: projected ? brand.teal : brand.income }} />}
                  {hasExpense && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: projected ? brand.teal : brand.expense }} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function DayList({ days, currency, language, onDay }: { days: BalanceDay[]; currency?: any; language?: any; onDay: (day: number) => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const shown = days.filter((d) => d.entrada + d.saida + d.diario + d.cartao + d.economia > 0 || d.isToday);
  if (shown.length === 0) return <Empty icon="receipt-outline" title={t('entries.emptyTitle')} subtitle={t('entries.emptySubtitle')} />;
  return (
    <View>
      {shown.map((d, i) => {
        const expense = d.saida + d.cartao + d.diario;
        return (
          <Pressable
            key={d.day}
            accessibilityRole="button"
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
                backgroundColor: d.isToday ? brand.blue : colors.hover,
              }}
            >
              <Txt variant="caption" color={d.isToday ? '#fff' : undefined} style={{ fontWeight: '700' }}>
                {d.day}
              </Txt>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              {d.entrada > 0 && (
                <Txt variant="small" color={brand.income} style={{ fontWeight: '700' }}>
                  +{formatCurrency(d.entrada, currency, language)}
                </Txt>
              )}
              {expense > 0 && (
                <Txt variant="small" color={brand.expense} style={{ fontWeight: '700' }}>
                  −{formatCurrency(expense, currency, language)}
                </Txt>
              )}
            </View>
            <Txt variant="small" color={d.balance >= 0 ? brand.income : brand.expense} style={{ minWidth: 84, textAlign: 'right', fontWeight: '700' }}>
              {formatCurrency(d.balance, currency, language)}
            </Txt>
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
  const [sheet, setSheet] = useState<{ open: boolean; date?: string }>({ open: false });

  const { data: profile } = useProfile();
  const { data, isLoading, isError, refetch, isRefetching } = useBalances(month, year);
  const { data: horizon } = useBalancesHorizon(year, true);

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
      <Screen refreshing={isRefetching} onRefresh={refetch}>
        <MonthSwitcher month={month} year={year} onChange={(m, y) => (setMonth(m), setYear(y))} />
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <Txt color={brand.expense} style={{ textAlign: 'center', marginTop: 32 }}>
            {t('balances.loadError')}
          </Txt>
        ) : (
          <>
            {days.length > 0 && (
              <>
                <Header days={days} currency={profile?.currency} language={profile?.language} />
                {chart.past.length > 1 && (
                  <View style={{ marginBottom: 12 }}>
                    <BalanceChart {...chart} height={170} />
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
              <Calendar days={days} month={month} year={year} onDay={goToDay} />
            ) : (
              <DayList days={days} currency={profile?.currency} language={profile?.language} onDay={goToDay} />
            )}
          </>
        )}
      </Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('entries.new')}
        onPress={() => setSheet({ open: true })}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: brand.blue,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
      <EntryFormSheet visible={sheet.open} defaultDate={sheet.date} onClose={() => setSheet({ open: false })} />
    </View>
  );
}
