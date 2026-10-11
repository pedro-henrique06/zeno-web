import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Card, Field, Loading, Money, Txt, ErrorState } from '@/ui';
import { MoneyInput } from '@/components/MoneyInput';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { useDeleteHouseGoal, useHouseBudget, useSaveHouseGoal } from '@/hooks/useHouses';
import { useGoal } from '@/hooks/useGoal';
import { formatCurrency } from '@/utils/currency';
import { formatMonths } from '@/utils/goalMath';
import type { House, HouseBudget } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

function Slice({ label, value, pct, color, note }: { label: string; value: string; pct: number; color: string; note?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Txt variant="small">
          {label} · {pct}%
        </Txt>
        <Txt variant="small" style={{ fontWeight: '700' }}>
          {value}
        </Txt>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.hover }}>
        <View style={{ width: `${pct}%`, height: 8, borderRadius: 4, backgroundColor: color }} />
      </View>
      {note ? (
        <Txt variant="caption" muted style={{ marginTop: 4 }}>
          {note}
        </Txt>
      ) : null}
    </View>
  );
}

function HouseGoalBlock({ house, budget, money }: { house: House; budget: HouseBudget; money: (v: number) => string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const save = useSaveHouseGoal(house.id);
  const remove = useDeleteHouseGoal(house.id);
  const goal = budget.goal;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(goal?.name ?? '');
  const [target, setTarget] = useState(goal ? Math.round(goal.targetAmount) : 0);
  const [error, setError] = useState(false);

  const onSave = () => {
    setError(false);
    save.mutate({ name: name.trim(), targetAmount: target }, { onSuccess: () => setEditing(false), onError: () => setError(true) });
  };

  const onRemove = () =>
    Alert.alert(t('houseBudget.goalRemove'), goal?.name, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('houseBudget.goalRemove'), style: 'destructive', onPress: () => remove.mutate() },
    ]);

  if (editing) {
    return (
      <View>
        <Field label={t('houseBudget.goalName')} value={name} onChangeText={setName} maxLength={60} />
        <MoneyInput label={t('houseBudget.goalTarget')} value={target} onChange={setTarget} currency={budget.currency} />
        {error && (
          <Txt variant="small" color={colors.expense} style={{ marginBottom: 8 }}>
            {t('houseBudget.goalError')}
          </Txt>
        )}
        <Button title={t('houseBudget.goalSave')} onPress={onSave} loading={save.isPending} disabled={!name.trim() || target <= 0} />
      </View>
    );
  }

  if (!goal) {
    return (
      <View>
        <Txt variant="small" muted style={{ marginBottom: 10 }}>
          {budget.isOwner ? t('houseBudget.goalEmptyOwner') : t('houseBudget.goalEmptyMember')}
        </Txt>
        {budget.isOwner && <Button variant="secondary" title={t('houseBudget.goalCreate')} onPress={() => setEditing(true)} />}
      </View>
    );
  }

  const reached = goal.accumulatedAmount >= goal.targetAmount;
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Txt style={{ fontWeight: '600', flexShrink: 1 }} numberOfLines={1}>
          {goal.name}
        </Txt>
        <Money style={{ fontSize: 18, color: brand.income }}>{goal.progressPercent.toFixed(goal.progressPercent % 1 === 0 ? 0 : 1)}%</Money>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(128,128,128,0.2)', marginVertical: 10, overflow: 'hidden' }}>
        <View style={{ width: `${goal.progressPercent}%`, height: 8, backgroundColor: brand.income }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt variant="caption" muted>
          {t('houseBudget.goalOf', { saved: money(goal.accumulatedAmount), target: money(goal.targetAmount) })}
        </Txt>
        <Txt variant="caption" color={reached ? brand.income : undefined} muted={!reached}>
          {reached
            ? t('houseBudget.goalReached')
            : goal.monthsRemaining === null
              ? t('houseBudget.goalNoEstimate')
              : t('houseBudget.goalRemaining', { time: formatMonths(goal.monthsRemaining) })}
        </Txt>
      </View>
      <Txt variant="caption" muted style={{ marginTop: 6 }}>
        {t('houseBudget.goalMonthly', { amount: money(goal.monthlyContribution) })}
      </Txt>
      {budget.isOwner && (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Button style={{ flex: 1 }} variant="secondary" title={t('houseBudget.goalEdit')} onPress={() => setEditing(true)} />
          <Button variant="ghost" title={t('houseBudget.goalRemove')} onPress={onRemove} disabled={remove.isPending} />
        </View>
      )}
    </View>
  );
}

export function HouseBudgetView({ house }: { house: House }) {
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { data: budget, isLoading, isError, refetch } = useHouseBudget(house.id, month, year);
  const { data: personalGoal } = useGoal();
  const { colors } = useTheme();

  if (isLoading) return <Loading />;
  if (isError || !budget) {
    return (
      <ErrorState message={t('houseBudget.loadError')} onRetry={refetch} />
    );
  }

  const money = (v: number) => formatCurrency(v, budget.currency);
  const fixedNote =
    budget.fixedExpenses <= 0
      ? t('houseBudget.fixedNone')
      : budget.needsRemaining >= 0
        ? t('houseBudget.fixedLeft', { fixed: money(budget.fixedExpenses), amount: money(budget.needsRemaining) })
        : t('houseBudget.fixedOver', { fixed: money(budget.fixedExpenses), amount: money(Math.abs(budget.needsRemaining)) });

  return (
    <View>
      <MonthSwitcher month={month} year={year} onChange={(m, y) => (setMonth(m), setYear(y))} />
      <Card dark>
        <Txt variant="label" color="rgba(255,255,255,0.55)">
          {t('houseBudget.totalIncome')}
        </Txt>
        <Money style={{ fontSize: 32, color: '#fff' }}>{money(budget.totalIncome)}</Money>
        <Txt variant="caption" color="rgba(255,255,255,0.55)">
          {t('houseBudget.residents', { count: budget.residentCount })}
        </Txt>
      </Card>

      {budget.totalIncome <= 0 ? (
        <Txt variant="small" muted style={{ marginTop: 16 }}>
          {t('houseBudget.noIncome')}
        </Txt>
      ) : (
        <View style={{ marginTop: 18 }}>
          <Slice label={t('houseBudget.needs')} value={money(budget.needs)} pct={50} color={brand.blue} note={fixedNote} />
          <Slice label={t('houseBudget.wants')} value={money(budget.wants)} pct={30} color={brand.warning} />
          <Slice label={t('houseBudget.savings')} value={money(budget.savings)} pct={20} color={brand.income} />
          <Card style={{ marginTop: 4 }}>
            <Txt variant="label" muted>
              {t('houseBudget.freePerPerson')}
            </Txt>
            <Money style={{ fontSize: 26 }}>{money(budget.freePerPerson)}</Money>
            <Txt variant="caption" muted>
              {t('houseBudget.freeHint', { amount: money(budget.wants), count: budget.residentCount })}
            </Txt>
          </Card>
        </View>
      )}

      <Txt variant="label" muted style={{ marginTop: 22, marginBottom: 8 }}>
        {t('houseBudget.goalTitle')}
      </Txt>
      <Card>
        <HouseGoalBlock key={budget.goal?.name ?? 'none'} house={house} budget={budget} money={money} />
      </Card>

      {personalGoal && (
        <Txt variant="caption" muted style={{ marginTop: 12 }}>
          {t('houseBudget.personalGoal')}: {personalGoal.name} ({personalGoal.progressPercent.toFixed(0)}%)
        </Txt>
      )}
      <Txt variant="caption" style={{ marginTop: 14, color: colors.textDisabled }}>
        {t('houseBudget.privacy')}
      </Txt>
    </View>
  );
}
