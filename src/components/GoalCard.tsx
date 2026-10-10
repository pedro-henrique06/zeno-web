import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Txt, Money } from '@/ui';
import { useGoal } from '@/hooks/useGoal';
import { formatCurrency } from '@/utils/currency';
import { formatMonths, monthsToGoal } from '@/utils/goalMath';
import type { Currency, Language } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

/** Savings goal progress; taps through to the simulator. Prompts to set one when missing. */
export function GoalCard({ currency, language }: { currency?: Currency; language?: Language }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { data: goal, isLoading } = useGoal();
  if (isLoading) return null;

  const open = () => router.push('/goals');

  if (!goal) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={open}
        style={{ marginTop: 16, padding: 14, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.divider }}
      >
        <Txt style={{ fontWeight: '600' }}>{t('goals.cardCta')}</Txt>
        <Txt variant="caption" muted>
          {t('goals.cardCtaHint')}
        </Txt>
      </Pressable>
    );
  }

  const reached = goal.savedAmount >= goal.targetAmount;
  const months = monthsToGoal(goal.targetAmount, goal.monthlyContribution, goal.annualRatePercent, goal.savedAmount);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={open}
      style={{ marginTop: 16, padding: 16, borderRadius: 16, backgroundColor: colors.paper, borderWidth: 0.5, borderColor: colors.divider }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <Txt style={{ fontWeight: '600', flexShrink: 1 }} numberOfLines={1}>
          {goal.name}
        </Txt>
        <Money style={{ fontSize: 18, color: brand.income }}>
          {goal.progressPercent.toFixed(goal.progressPercent % 1 === 0 ? 0 : 1)}%
        </Money>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.hover, marginVertical: 10, overflow: 'hidden' }}>
        <View style={{ width: `${goal.progressPercent}%`, height: 8, borderRadius: 4, backgroundColor: brand.income }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Txt variant="caption" muted>
          {t('goals.of', { saved: formatCurrency(goal.savedAmount, currency, language), target: formatCurrency(goal.targetAmount, currency, language) })}
        </Txt>
        <Txt variant="caption" color={reached ? brand.income : undefined} muted={!reached} style={{ fontWeight: reached ? '700' : '400' }}>
          {reached ? t('goals.reached') : t('goals.remaining', { time: formatMonths(months) })}
        </Txt>
      </View>
    </Pressable>
  );
}
