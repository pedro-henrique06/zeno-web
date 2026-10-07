import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Field, Loading, Row, Screen, Section, Sheet } from '@/ui';
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from '@/hooks/useTags';
import type { Tag } from '@/types';

export default function TagsScreen() {
  const { t } = useTranslation();
  const { data: tags, isLoading, refetch, isRefetching } = useTags();
  const create = useCreateTag();
  const update = useUpdateTag();
  const remove = useDeleteTag();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [name, setName] = useState('');

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
    Alert.alert(t('entryForm.deleteConfirmTitle'), editing.name, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('entryForm.delete'), style: 'destructive', onPress: () => remove.mutate(editing.id, { onSuccess: close }) },
    ]);
  };

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <Button title={t('categories.newTitle')} icon="add" onPress={() => show(null)} />
      {isLoading ? (
        <Loading />
      ) : !tags || tags.length === 0 ? (
        <Empty icon="pricetags-outline" title={t('categories.emptyTitle')} subtitle={t('categories.emptySubtitle')} />
      ) : (
        <Section>
          {tags.map((tag, i) => (
            <Row key={tag.id} icon="pricetag-outline" title={tag.name} onPress={() => show(tag)} last={i === tags.length - 1} />
          ))}
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
