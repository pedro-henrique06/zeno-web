import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Field, Loading, Row, Screen, Section, Sheet, Txt } from '@/ui';
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from '@/hooks/useTags';
import { useEntries } from '@/hooks/useEntries';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { isCredit } from '@/utils/entryKind';
import type { Tag } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

export default function TagsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data: tags, isLoading, refetch, isRefetching } = useTags();
  const now = new Date();
  // Same query key as the Entries tab for the current month, so it's usually already cached.
  const { data: entries } = useEntries(now.getMonth() + 1, now.getFullYear(), 1, 200);
  const { data: profile } = useProfile();
  const create = useCreateTag();
  const update = useUpdateTag();
  const remove = useDeleteTag();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [name, setName] = useState('');

  // Spending per tag this month (income left out), largest first.
  const usage = useMemo(() => {
    const map = new Map<string, { spent: number; count: number }>();
    for (const e of entries?.items ?? []) {
      if (!e.tagId || isCredit(e.kind)) continue;
      const u = map.get(e.tagId) ?? { spent: 0, count: 0 };
      u.spent += e.value;
      u.count += 1;
      map.set(e.tagId, u);
    }
    return map;
  }, [entries]);
  const sorted = useMemo(
    () => [...(tags ?? [])].sort((a, b) => (usage.get(b.id)?.spent ?? 0) - (usage.get(a.id)?.spent ?? 0) || a.name.localeCompare(b.name)),
    [tags, usage],
  );
  const maxSpent = Math.max(1, ...Array.from(usage.values(), (u) => u.spent));

  const show = (tag: Tag | null) => {
    setEditing(tag);
    setName(tag?.name ?? '');
    setOpen(true);
  };
  const close = () => setOpen(false);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editing) update.mutate({ id: editing.id, name: trimmed }, { onSuccess: close });
    else create.mutate({ name: trimmed }, { onSuccess: close });
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(t('categories.deleteTitle', { name: editing.name }), t('categories.deleteMessage'), [
      { text: t('common.keep'), style: 'cancel' },
      { text: t('categories.deleteButton'), style: 'destructive', onPress: () => remove.mutate(editing.id, { onSuccess: close }) },
    ]);
  };

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <Txt variant="heading" style={{ marginBottom: 14 }}>
        {t('categories.title')}
      </Txt>
      <Button title={t('categories.newTitle')} icon="add" onPress={() => show(null)} />
      {isLoading ? (
        <Loading />
      ) : !tags || tags.length === 0 ? (
        <Empty icon="pricetags-outline" title={t('categories.emptyTitle')} subtitle={t('categories.emptySubtitle')} />
      ) : (
        <Section>
          {sorted.map((tag, i) => {
            const u = usage.get(tag.id);
            return (
              <View key={tag.id}>
                <Row
                  icon="pricetag-outline"
                  title={tag.name}
                  subtitle={u ? t('categories.monthCount', { count: u.count }) : t('categories.noUse')}
                  right={
                    u ? (
                      <Txt variant="small" color={colors.expense} style={{ fontWeight: '700' }}>
                        {formatCurrency(u.spent, profile?.currency, profile?.language)}
                      </Txt>
                    ) : undefined
                  }
                  onPress={() => show(tag)}
                  last={i === sorted.length - 1}
                />
                {u && (
                  <View style={{ position: 'absolute', left: 60, right: 14, bottom: 6, height: 3, borderRadius: 2, backgroundColor: colors.hover }}>
                    <View style={{ width: `${(u.spent / maxSpent) * 100}%`, height: 3, borderRadius: 2, backgroundColor: brand.expense }} />
                  </View>
                )}
              </View>
            );
          })}
        </Section>
      )}
      <Sheet visible={open} onClose={close} title={editing ? t('categories.editTitle') : t('categories.newTitle')}>
        <Field label={t('categories.name')} value={name} onChangeText={setName} autoFocus />
        <Button title={t('common.save')} onPress={save} loading={create.isPending || update.isPending} disabled={!name.trim()} />
        {editing && (
          <View style={{ marginTop: 10 }}>
            <Button variant="ghost" title={t('entryForm.delete')} onPress={confirmDelete} disabled={remove.isPending} />
          </View>
        )}
      </Sheet>
    </Screen>
  );
}
