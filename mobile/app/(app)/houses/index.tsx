import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Field, Loading, Row, Screen, Section, Sheet, Txt } from '@/ui';
import { useCreateHouse, useHouses } from '@/hooks/useHouses';
import { brand } from '@/theme/ThemeContext';

export default function HousesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: houses, isLoading, isError, refetch, isRefetching } = useHouses();
  const create = useCreateHouse();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const save = () =>
    create.mutate(
      { name: name.trim(), description: description.trim() },
      {
        onSuccess: (house) => {
          setOpen(false);
          setName('');
          setDescription('');
          router.push({ pathname: '/houses/[id]', params: { id: house.id } });
        },
      },
    );

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <Button title={t('houses.newTitle')} icon="add" onPress={() => setOpen(true)} />
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Txt color={brand.expense} style={{ marginTop: 24, textAlign: 'center' }}>
          {t('houses.loadError')}
        </Txt>
      ) : !houses || houses.length === 0 ? (
        <Empty icon="home-outline" title={t('houses.emptyTitle')} subtitle={t('houses.emptySubtitle')} />
      ) : (
        <Section>
          {houses.map((house, i) => (
            <Row
              key={house.id}
              icon="home-outline"
              title={house.name}
              subtitle={house.description || undefined}
              onPress={() => router.push({ pathname: '/houses/[id]', params: { id: house.id } })}
              last={i === houses.length - 1}
            />
          ))}
        </Section>
      )}
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('houses.newTitle')}>
        <Field label={t('houses.name')} value={name} onChangeText={setName} autoFocus />
        <Field label={t('houses.description')} value={description} onChangeText={setDescription} />
        <Button title={t('common.create')} onPress={save} loading={create.isPending} disabled={!name.trim()} />
      </Sheet>
    </Screen>
  );
}
