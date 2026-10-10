import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, Card, Empty, Field, Loading, Money, Row, Screen, Section, Sheet, Txt, ErrorState } from '@/ui';
import {
  useCreateMonthlyExpenseCategory,
  useDeleteMonthlyExpenseCategory,
  useMonthlyExpenseCategories,
  useUpdateMonthlyExpenseCategory,
} from '@/hooks/useMonthlyExpenseCategories';
import { useProfile, useUpdateDailyBudget } from '@/hooks/useUser';
import { CURRENCY_SYMBOLS, formatCurrency } from '@/utils/currency';
import type { MonthlyExpenseCategory } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

export default function DailyBudgetScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data: profile } = useProfile();
  const { data: categories, isLoading, isError, refetch } = useMonthlyExpenseCategories();
  const { mutate: syncDailyBudget } = useUpdateDailyBudget();
  const create = useCreateMonthlyExpenseCategory();
  const update = useUpdateMonthlyExpenseCategory();
  const remove = useDeleteMonthlyExpenseCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MonthlyExpenseCategory | null>(null);
  const [name, setName] = useState('');
  const [cents, setCents] = useState(0);

  const days = dayjs().daysInMonth();
  const total = (categories ?? []).reduce((sum, c) => sum + c.amount, 0);
  const daily = days > 0 ? total / days : 0;

  // Keep the profile's daily budget in sync with the monthly categories.
  useEffect(() => {
    if (!categories || !profile) return;
    const rounded = Math.round(daily * 100) / 100;
    const current = Math.round((profile.dailyBudget ?? 0) * 100) / 100;
    if (rounded !== current) syncDailyBudget({ dailyBudget: rounded });
  }, [categories, profile, daily, syncDailyBudget]);

  const money = (v: number) => formatCurrency(v, profile?.currency, profile?.language);
  const show = (category: MonthlyExpenseCategory | null) => {
    setEditing(category);
    setName(category?.name ?? '');
    setCents(Math.round((category?.amount ?? 0) * 100));
    setOpen(true);
  };
  const close = () => setOpen(false);

  const save = () => {
    const payload = { name: name.trim(), amount: cents / 100 };
    if (editing) update.mutate({ id: editing.id, ...payload }, { onSuccess: close });
    else create.mutate(payload, { onSuccess: close });
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(t('dailyBudget.deleteTitle', { name: editing.name }), t('dailyBudget.deleteMessage'), [
      { text: t('common.keep'), style: 'cancel' },
      { text: t('dailyBudget.deleteButton'), style: 'destructive', onPress: () => remove.mutate(editing.id, { onSuccess: close }) },
    ]);
  };

  return (
    <Screen>
      {isError ? (
        <ErrorState message={t('dailyBudget.loadError')} onRetry={refetch} />
      ) : isLoading ? (
        <Loading />
      ) : (
        <>
          <Card dark>
            <Txt variant="label" color="rgba(255,255,255,0.55)">
              {t('dailyBudget.totalMonthly')}
            </Txt>
            <Money style={{ fontSize: 32, color: '#fff' }}>{money(total)}</Money>
            <Txt variant="small" color={brand.teal} style={{ marginTop: 4 }}>
              ÷ {days} {t('dailyBudget.days')} = {money(daily)}
            </Txt>
          </Card>
          <View style={{ marginTop: 16 }}>
            <Button title={t('monthlyExpenseCategory.saveNew')} icon="add" onPress={() => show(null)} />
          </View>
          {categories && categories.length > 0 ? (
            <Section>
              {categories.map((c, i) => (
                <Row
                  key={c.id}
                  title={c.name}
                  right={<Txt style={{ fontWeight: '700' }}>{money(c.amount)}</Txt>}
                  onPress={() => show(c)}
                  last={i === categories.length - 1}
                />
              ))}
            </Section>
          ) : (
            <Empty icon="speedometer-outline" title={t('dailyBudget.title')} />
          )}
        </>
      )}
      <Sheet visible={open} onClose={close} title={editing ? t('monthlyExpenseCategory.saveExisting') : t('monthlyExpenseCategory.saveNew')}>
        <Field label={t('monthlyExpenseCategory.descriptionPlaceholder')} value={name} onChangeText={setName} />
        <Field
          label={CURRENCY_SYMBOLS[profile?.currency ?? 'BRL']}
          value={(cents / 100).toFixed(2)}
          onChangeText={(text) => setCents(Math.min(Number(text.replace(/\D/g, '') || '0'), 99_999_999_99))}
          keyboardType="number-pad"
          selectTextOnFocus
        />
        <Button
          title={t('common.save')}
          onPress={save}
          loading={create.isPending || update.isPending}
          disabled={!name.trim() || cents <= 0}
        />
        {editing && (
          <View style={{ marginTop: 10 }}>
            <Button variant="ghost" title={t('entryForm.delete')} onPress={confirmDelete} disabled={remove.isPending} />
          </View>
        )}
      </Sheet>
    </Screen>
  );
}
