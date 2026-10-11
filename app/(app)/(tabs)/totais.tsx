import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card, Loading, Money, Row, Screen, Section, Txt, ErrorState } from '@/ui';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { GoalCard } from '@/components/GoalCard';
import { useSummary } from '@/hooks/useSummary';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { EntryKind } from '@/types';
import { EntryKindColors, useEntryKindLabels } from '@/utils/entryKind';
import { brand, useTheme } from '@/theme/ThemeContext';

export default function TotalsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { data: profile } = useProfile();
  const { data, isLoading, isError, refetch, isRefetching } = useSummary(month, year);
  const kindLabels = useEntryKindLabels();
  const money = (v: number) => formatCurrency(v, profile?.currency, profile?.language);
  const projectedDaily = data ? data.costOfLiving - (data.movements.saida + data.movements.diario + data.movements.cartao) : 0;

  return (
    <Screen
      title={t('appLayout.totals')}
      headerRight={<MonthSwitcher compact month={month} year={year} onChange={(m, y) => (setMonth(m), setYear(y))} />}
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      {isLoading || !data ? (
        isError ? (
          <ErrorState message={t('dashboard.loadError')} onRetry={refetch} />
        ) : (
          <Loading />
        )
      ) : (
        <>
          <Card dark>
            <Txt variant="label" color="rgba(255,255,255,0.7)">
              {t('dashboard.monthBalance')}
            </Txt>
            <Money style={{ fontSize: 36, color: '#fff', marginTop: 4 }}>
              {data.performance >= 0 ? '+' : ''}
              {money(data.performance)}
            </Money>
            <Txt variant="caption" color={data.performance >= 0 ? brand.income : brand.expense} style={{ marginTop: 2, fontWeight: '700' }}>
              {data.performance >= 0 ? t('dashboard.moneyLeftOver') : t('dashboard.moneyShort')}
              <Txt variant="caption" color="rgba(255,255,255,0.7)">
                {'  ·  '}
                {t('dashboard.monthBalanceHint')}
              </Txt>
            </Txt>
            {/* Spending is costOfLiving so the row adds up: income − spending = month result. */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.15)' }}>
              {[
                { l: t('dashboard.income'), v: data.movements.entrada, c: brand.income },
                { l: t('dashboard.expenses'), v: data.costOfLiving, c: brand.expense },
                { l: t('dashboard.savedColumn'), v: data.movements.economia, c: brand.teal },
              ].map((s) => (
                <View key={s.l} style={{ flex: 1 }}>
                  <Txt variant="label" color="rgba(255,255,255,0.7)" style={{ fontSize: 10 }}>
                    {s.l}
                  </Txt>
                  <Money style={{ fontSize: 16, color: s.c }} numberOfLines={1} adjustsFontSizeToFit>
                    {money(s.v)}
                  </Money>
                </View>
              ))}
            </View>
            {projectedDaily > 0.005 && (
              <Txt variant="caption" color="rgba(255,255,255,0.7)" style={{ marginTop: 10 }}>
                {t('dashboard.projectedDaily', { value: money(projectedDaily) })}
              </Txt>
            )}
            {data.movements.economia > 0 && (
              <Txt variant="caption" color="rgba(255,255,255,0.7)" style={{ marginTop: 4 }}>
                {t('dashboard.afterSaving', { value: money(data.performance - data.movements.economia) })}
              </Txt>
            )}
          </Card>

          <GoalCard currency={profile?.currency} language={profile?.language} />

          <Section title={t('dashboard.monthlyCalculations')}>
            <Row
              title={t('dashboard.saved')}
              subtitle={data.economizedPercent > 0 ? t('dashboard.savedHint') : t('dashboard.nothingSaved')}
              right={<Txt style={{ fontWeight: '700' }}>{data.economizedPercent.toFixed(1)}%</Txt>}
            />
            <Row title={t('dashboard.costOfLiving')} subtitle={t('dashboard.costOfLivingHint')} right={<Txt style={{ fontWeight: '700' }}>{money(data.costOfLiving)}</Txt>} />
            <Row
              last
              title={t('dashboard.dailyAverage')}
              subtitle={t('dashboard.dailyAverageHint')}
              right={<Txt style={{ fontWeight: '700' }}>{money(data.dailyAverageReal)}</Txt>}
            />
          </Section>

          <Section>
            <Row icon="stats-chart" sf="chart.bar.fill" tint="#1F7A77" title={t('dashboard.title')} subtitle={t('dashboard.subtitle', { month: year })} onPress={() => router.push('/horizon')} last />
          </Section>

          <Section title={t('dashboard.monthMovements')}>
            {(
              [
                [EntryKind.Entrada, kindLabels[EntryKind.Entrada], data.movements.entrada],
                [EntryKind.Saida, kindLabels[EntryKind.Saida], data.movements.saida],
                [EntryKind.Diario, kindLabels[EntryKind.Diario], data.movements.diario],
                [EntryKind.Economia, kindLabels[EntryKind.Economia], data.movements.economia],
                [EntryKind.Cartao, kindLabels[EntryKind.Cartao], data.movements.cartao],
              ] as const
            ).map(([kind, label, value], i, all) => {
              const max = Math.max(...all.map((a) => a[2]), 1);
              return (
                <View key={kind} style={{ padding: 14, borderBottomWidth: i < all.length - 1 ? 0.5 : 0, borderBottomColor: colors.divider }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Txt variant="small">{label}</Txt>
                    <Txt variant="small" style={{ fontWeight: '700' }}>
                      {money(value)}
                    </Txt>
                  </View>
                  <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.hover }}>
                    <View style={{ height: 5, borderRadius: 3, width: `${(value / max) * 100}%`, backgroundColor: EntryKindColors[kind] }} />
                  </View>
                </View>
              );
            })}
          </Section>
        </>
      )}
    </Screen>
  );
}
