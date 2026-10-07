import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, Loading, Money, Screen, Section, Segmented, Txt } from '@/ui';
import {
  useCostOfLivingHorizon,
  useDailyAverageHorizon,
  useEconomizedHorizon,
  usePerformanceHorizon,
} from '@/hooks/useSummary';
import { useBalancesHorizon } from '@/hooks/useBalances';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { brand, useTheme } from '@/theme/ThemeContext';

type Metric = 'balances' | 'performance' | 'economized' | 'costOfLiving' | 'dailyAverage';

interface MonthValue {
  month: number;
  value: number;
  /** Shown instead of the money value (the economized metric is a percentage). */
  label?: string;
  positiveGood?: boolean;
}

export default function HorizonScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { data: profile } = useProfile();
  const [metric, setMetric] = useState<Metric>('performance');
  const [year, setYear] = useState(new Date().getFullYear());

  const balances = useBalancesHorizon(year, metric === 'balances');
  const performance = usePerformanceHorizon(year, metric === 'performance');
  const economized = useEconomizedHorizon(year, metric === 'economized');
  const cost = useCostOfLivingHorizon(year, metric === 'costOfLiving');
  const daily = useDailyAverageHorizon(year, metric === 'dailyAverage');

  const money = (v: number) => formatCurrency(v, profile?.currency, profile?.language);
  const monthName = (m: number) => new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(new Date(year, m - 1, 1));

  let loading = false;
  let rows: MonthValue[] = [];
  let total: { label: string; value: string } | null = null;

  if (metric === 'balances') {
    loading = balances.isLoading;
    // Balance at the end of each month.
    rows = (balances.data?.months ?? []).map((m) => ({ month: m.month, value: m.days.length ? m.days[m.days.length - 1].balance : 0 }));
  } else if (metric === 'performance') {
    loading = performance.isLoading;
    rows = (performance.data?.months ?? []).map((m) => ({ month: m.month, value: m.performance }));
    total = { label: t('horizon.performance.totalByMonth'), value: money(rows.reduce((s, r) => s + r.value, 0)) };
  } else if (metric === 'economized') {
    loading = economized.isLoading;
    rows = (economized.data?.months ?? []).map((m) => ({ month: m.month, value: m.economizedPercent, label: `${m.economizedPercent.toFixed(1)}%` }));
    if (economized.data) total = { label: t('horizon.economized.totalYear'), value: `${economized.data.economizedPercent.toFixed(1)}%` };
  } else if (metric === 'costOfLiving') {
    loading = cost.isLoading;
    rows = (cost.data?.months ?? []).map((m) => ({ month: m.month, value: m.costOfLiving, positiveGood: false }));
    if (cost.data) total = { label: t('horizon.costOfLiving.totalYear'), value: money(cost.data.costOfLiving) };
  } else {
    loading = daily.isLoading;
    rows = (daily.data?.months ?? []).map((m) => ({ month: m.month, value: m.dailyAverage, positiveGood: false }));
  }

  const max = Math.max(1, ...rows.map((r) => Math.abs(r.value)));
  const explanation =
    metric === 'balances'
      ? t('horizon.balances.title')
      : t(`horizon.${metric}.explanation`);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Pressable hitSlop={12} accessibilityRole="button" onPress={() => setYear((y) => y - 1)}>
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </Pressable>
        <Txt variant="title">{year}</Txt>
        <Pressable hitSlop={12} accessibilityRole="button" onPress={() => setYear((y) => y + 1)}>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Segmented
        value={metric}
        onChange={setMetric}
        options={[
          { value: 'performance', label: t('horizon.performance.title') },
          { value: 'economized', label: '%' },
          { value: 'costOfLiving', label: t('dashboard.costOfLiving') },
          { value: 'dailyAverage', label: t('dashboard.dailyAverage') },
          { value: 'balances', label: t('appLayout.balances') },
        ]}
      />

      <Txt variant="small" muted style={{ marginTop: 12 }}>
        {explanation}
      </Txt>

      {total && (
        <Card dark style={{ marginTop: 14 }}>
          <Txt variant="label" color="rgba(255,255,255,0.55)">
            {total.label}
          </Txt>
          <Money style={{ fontSize: 30, color: '#fff' }}>{total.value}</Money>
        </Card>
      )}

      {loading ? (
        <Loading />
      ) : (
        <Section>
          {rows.map((r, i) => {
            const good = r.positiveGood === false ? false : r.value >= 0;
            const color = r.positiveGood === false ? brand.blue : good ? brand.income : brand.expense;
            return (
              <View key={r.month} style={{ padding: 12, borderBottomWidth: i < rows.length - 1 ? 0.5 : 0, borderBottomColor: colors.divider }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Txt variant="small" style={{ textTransform: 'capitalize' }}>
                    {monthName(r.month)}
                  </Txt>
                  <Txt variant="small" style={{ fontWeight: '700' }}>
                    {r.label ?? money(r.value)}
                  </Txt>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.hover }}>
                  <View style={{ height: 6, borderRadius: 3, width: `${(Math.abs(r.value) / max) * 100}%`, backgroundColor: color }} />
                </View>
              </View>
            );
          })}
        </Section>
      )}
    </Screen>
  );
}
