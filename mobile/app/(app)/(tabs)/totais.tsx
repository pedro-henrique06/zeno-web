import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Loading, Money, Row, Screen, Section, Txt } from '@/ui';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { GoalCard } from '@/components/GoalCard';
import { useSummary } from '@/hooks/useSummary';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { EntryKind } from '@/types';
import { EntryKindColors } from '@/utils/entryKind';
import { brand, useTheme } from '@/theme/ThemeContext';

export default function TotalsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { data: profile } = useProfile();
  const { data, isLoading, isError, refetch, isRefetching } = useSummary(month, year);
  const money = (v: number) => formatCurrency(v, profile?.currency, profile?.language);

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <MonthSwitcher month={month} year={year} onChange={(m, y) => (setMonth(m), setYear(y))} />
      {isLoading || !data ? (
        isError ? (
          <Txt color={brand.expense} style={{ textAlign: 'center', marginTop: 32 }}>
            {t('dashboard.loadError')}
          </Txt>
        ) : (
          <Loading />
        )
      ) : (
        <>
          <Card dark>
            <Txt variant="label" color="rgba(255,255,255,0.55)">
              {t('dashboard.monthBalance')}
            </Txt>
            <Money style={{ fontSize: 36, color: '#fff', marginTop: 4 }}>
              {data.performance >= 0 ? '+' : ''}
              {money(data.performance)}
            </Money>
            <Txt variant="caption" color={data.performance >= 0 ? brand.income : brand.expense} style={{ marginTop: 2, fontWeight: '700' }}>
              {data.performance >= 0 ? t('dashboard.moneyLeftOver') : t('dashboard.moneyShort')}
            </Txt>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 16, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.15)' }}>
              {[
                { l: t('dashboard.income'), v: data.movements.entrada, c: brand.income },
                { l: t('dashboard.expenses'), v: data.movements.saida + data.movements.cartao, c: brand.expense },
              ].map((s) => (
                <View key={s.l} style={{ flex: 1 }}>
                  <Txt variant="label" color="rgba(255,255,255,0.55)" style={{ fontSize: 10 }}>
                    {s.l}
                  </Txt>
                  <Money style={{ fontSize: 18, color: s.c }} numberOfLines={1} adjustsFontSizeToFit>
                    {money(s.v)}
                  </Money>
                </View>
              ))}
            </View>
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

          <Section title={t('dashboard.monthMovements')}>
            {(
              [
                [EntryKind.Entrada, t('dashboard.income'), data.movements.entrada],
                [EntryKind.Saida, t('dashboard.expenses'), data.movements.saida],
                [EntryKind.Diario, t('dashboard.daily'), data.movements.diario],
                [EntryKind.Economia, t('dashboard.savings'), data.movements.economia],
                [EntryKind.Cartao, t('dashboard.cardSpending'), data.movements.cartao],
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
