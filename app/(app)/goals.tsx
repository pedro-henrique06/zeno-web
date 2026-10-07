import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { Button, Card, Field, Money, Screen, Section, Txt } from '@/ui';
import { MoneyInput } from '@/components/MoneyInput';
import { useGoal, useDeleteGoal, useSaveGoal } from '@/hooks/useGoal';
import { useProfile } from '@/hooks/useUser';
import { LANGUAGE_LOCALES } from '@/utils/currency';
import { formatMonths, futureValue, irRate, monthsToGoal } from '@/utils/goalMath';
import type { Goal } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

const MULTIPLIERS = [0.5, 0.75, 1, 1.5, 2, 3, 4];

function monthsColor(months: number): string {
  const years = months / 12;
  if (years > 15) return brand.expense;
  if (years > 7) return brand.warning;
  return brand.income;
}

function GoalForm({ goal }: { goal: Goal | null | undefined }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data: profile } = useProfile();
  const save = useSaveGoal();
  const remove = useDeleteGoal();

  const [name, setName] = useState(goal?.name ?? '');
  const [target, setTarget] = useState(goal ? Math.round(goal.targetAmount) : 1_000_000);
  const [pmt, setPmt] = useState(goal ? Math.round(goal.monthlyContribution) : 500);
  const [initial, setInitial] = useState(goal ? Math.round(goal.initialAmount) : 0);
  const [rate, setRate] = useState(goal?.annualRatePercent ?? 14.55);
  const [notice, setNotice] = useState<string | null>(null);

  const currency = profile?.currency ?? 'BRL';
  const locale = LANGUAGE_LOCALES[profile?.language ?? 'PtBR'];
  const fmt = (v: number) =>
    isFinite(v) ? new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(v) : '—';

  const months = useMemo(() => monthsToGoal(target, pmt, rate, initial), [target, pmt, rate, initial]);
  const invested = initial + pmt * months;
  const gross = futureValue(pmt, months, rate, initial) - invested;
  const tax = isFinite(months) ? gross * irRate(months) : 0;
  const net = gross - tax;

  const scenarios = useMemo(
    () => MULTIPLIERS.map((m) => ({ m, pmt: pmt * m, months: monthsToGoal(target, pmt * m, rate, initial) })),
    [pmt, target, rate, initial],
  );
  const maxMonths = Math.max(1, ...scenarios.map((s) => s.months).filter(isFinite));

  const canSave = target > 0 && pmt > 0 && name.trim().length > 0;

  const onSave = () =>
    save.mutate(
      {
        name: name.trim(),
        targetAmount: target,
        monthlyContribution: pmt,
        initialAmount: initial,
        annualRatePercent: Math.round(rate * 100) / 100,
      },
      { onSuccess: () => setNotice(t('goals.saved')), onError: () => setNotice(t('goals.saveError')) },
    );

  const onRemove = () =>
    Alert.alert(t('goals.remove'), goal?.name, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('goals.remove'),
        style: 'destructive',
        onPress: () =>
          remove.mutate(undefined, { onSuccess: () => setNotice(t('goals.removed')), onError: () => setNotice(t('goals.saveError')) }),
      },
    ]);

  return (
    <>
      <Card dark>
        <Txt variant="label" color="rgba(255,255,255,0.5)">
          Taxa de juros (a.a.)
        </Txt>
        <Money style={{ fontSize: 28, color: '#fff' }}>{rate.toFixed(2)}%</Money>
        <Slider
          value={rate}
          minimumValue={2}
          maximumValue={25}
          step={0.05}
          onValueChange={setRate}
          minimumTrackTintColor={brand.blue}
          maximumTrackTintColor="rgba(255,255,255,0.25)"
          thumbTintColor={brand.blue}
          style={{ marginTop: 8 }}
        />
        <Txt variant="caption" color="rgba(255,255,255,0.45)">
          Sugestão: Selic/CDI (~14%)
        </Txt>
      </Card>

      <View style={{ height: 16 }} />
      <MoneyInput label="Valor da meta" value={target} onChange={setTarget} currency={currency} language={profile?.language} />
      <MoneyInput label="Aporte mensal" value={pmt} onChange={setPmt} currency={currency} language={profile?.language} />
      <MoneyInput label={t('goals.initialLabel')} value={initial} onChange={setInitial} currency={currency} language={profile?.language} />
      <Field label={t('goals.nameLabel')} value={name} onChangeText={setName} placeholder={t('goals.namePlaceholder')} maxLength={60} />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button style={{ flex: 1 }} title={goal ? t('goals.update') : t('goals.save')} onPress={onSave} loading={save.isPending} disabled={!canSave} />
        {goal && <Button variant="secondary" title={t('goals.remove')} onPress={onRemove} disabled={remove.isPending} />}
      </View>
      {notice && (
        <Txt variant="small" muted style={{ marginTop: 10 }}>
          {notice}
        </Txt>
      )}

      <Section title="Resultado">
        <View style={{ padding: 14, gap: 10 }}>
          <Txt variant="small" muted>
            Você chega lá em
          </Txt>
          <Money style={{ fontSize: 34, color: isFinite(months) ? monthsColor(months) : colors.textSecondary }}>{formatMonths(months)}</Money>
          {[
            ['Total investido', fmt(invested)],
            ['Rendimento bruto', fmt(gross)],
            [`IR (${(irRate(months) * 100).toFixed(1)}%)`, fmt(tax)],
            ['Rendimento líquido', fmt(net)],
          ].map(([label, value]) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt variant="small" muted>
                {label}
              </Txt>
              <Txt variant="small" style={{ fontWeight: '700' }}>
                {value}
              </Txt>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Cenários de aporte">
        <View style={{ padding: 14, gap: 10 }}>
          {scenarios.map((s) => {
            const base = s.m === 1;
            const width = isFinite(s.months) ? Math.min((s.months / maxMonths) * 100, 100) : 100;
            return (
              <View key={s.m} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Txt variant="caption" muted={!base} style={{ width: 76, textAlign: 'right', fontWeight: base ? '700' : '400' }}>
                  {fmt(s.pmt)}
                </Txt>
                <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.hover }}>
                  <View style={{ width: `${width}%`, height: 8, borderRadius: 4, backgroundColor: monthsColor(s.months) }} />
                </View>
                <Txt variant="caption" color={base ? monthsColor(s.months) : colors.textSecondary} style={{ width: 60, fontWeight: base ? '700' : '400' }}>
                  {formatMonths(s.months)}
                </Txt>
              </View>
            );
          })}
        </View>
      </Section>
    </>
  );
}

export default function GoalsScreen() {
  const { data: goal, isLoading } = useGoal();
  if (isLoading) return <Screen>{null}</Screen>;
  // Mount the form after the saved goal loaded so it starts from those values.
  return (
    <Screen>
      <GoalForm key={goal?.id ?? 'new'} goal={goal} />
    </Screen>
  );
}
