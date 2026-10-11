import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Field, Loading, Row, Screen, Section, Segmented, Txt } from '@/ui';
import { HouseBudgetView } from '@/components/HouseBudgetView';
import {
  useAddHouseMember,
  useDeleteHouse,
  useHouseEntries,
  useHouses,
  useRemoveHouseMember,
  useUpdateHouse,
} from '@/hooks/useHouses';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { useEntryKindLabels } from '@/utils/entryKind';
import type { House } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

type Tab = 'budget' | 'entries' | 'members';

function EntriesTab({ house }: { house: House }) {
  const { t } = useTranslation();
  const { data: entries, isLoading } = useHouseEntries(house.id);
  const { data: profile } = useProfile();
  const kindLabels = useEntryKindLabels();
  if (isLoading) return <Loading />;
  if (!entries || entries.length === 0) return <Empty icon="repeat-outline" title={t('houses.noEntries')} subtitle={t('houses.noEntriesHint')} />;
  return (
    <Section>
      {entries.map((e, i) => (
        <Row
          key={e.id}
          title={e.title}
          subtitle={kindLabels[e.kind]}
          right={<Txt style={{ fontWeight: '700' }}>{formatCurrency(e.value, profile?.currency, profile?.language)}</Txt>}
          last={i === entries.length - 1}
        />
      ))}
    </Section>
  );
}

function MembersTab({ house, isOwner }: { house: House; isOwner: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const add = useAddHouseMember(house.id);
  const remove = useRemoveHouseMember(house.id);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const members = house.members ?? [];

  const invite = () => {
    setError('');
    add.mutate(email.trim(), {
      onSuccess: () => setEmail(''),
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0];
        setError(msg ?? t('houses.inviteError'));
      },
    });
  };

  const confirmRemove = (memberId: string, name: string) =>
    Alert.alert(t('houses.members'), name, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('entryForm.delete'), style: 'destructive', onPress: () => remove.mutate(memberId) },
    ]);

  return (
    <View>
      <Section title={t('houses.owner')}>
        <Row icon="person-circle-outline" title={isOwner ? (user?.name ?? '') : t('houses.owner')} subtitle={isOwner ? user?.email : undefined} last />
      </Section>
      {members.length > 0 ? (
        <Section title={t('houses.members')}>
          {members.map((m, i) => (
            <Row
              key={m.userId}
              icon="person-outline"
              title={m.name}
              subtitle={m.email}
              onPress={isOwner ? () => confirmRemove(m.userId, m.name) : undefined}
              right={isOwner ? <Txt variant="caption" color={colors.expense}>{t('entryForm.delete')}</Txt> : undefined}
              last={i === members.length - 1}
            />
          ))}
        </Section>
      ) : (
        <Txt variant="small" muted style={{ marginTop: 16 }}>
          {t('houses.noMembers')}. {t('houses.noMembersHint')}
        </Txt>
      )}
      {isOwner && (
        <View style={{ marginTop: 22 }}>
          <Field
            label={t('houses.memberEmail')}
            value={email}
            onChangeText={(v) => (setEmail(v), setError(''))}
            keyboardType="email-address"
            autoCapitalize="none"
            error={error}
          />
          <Button title={t('houses.invite')} onPress={invite} loading={add.isPending} disabled={!email.trim()} />
        </View>
      )}
    </View>
  );
}

function Settings({ house }: { house: House }) {
  const { t } = useTranslation();
  const router = useRouter();
  const update = useUpdateHouse();
  const remove = useDeleteHouse();
  const [name, setName] = useState(house.name);
  const [description, setDescription] = useState(house.description ?? '');

  const confirmDelete = () =>
    Alert.alert(t('houses.deleteTitle', { name: house.name }), t('houses.deleteMessage'), [
      { text: t('common.keep'), style: 'cancel' },
      { text: t('houses.deleteButton'), style: 'destructive', onPress: () => remove.mutate(house.id, { onSuccess: () => router.back() }) },
    ]);

  return (
    <View style={{ marginTop: 28 }}>
      <Txt variant="label" muted style={{ marginBottom: 8 }}>
        {t('houses.editTitle')}
      </Txt>
      <Field label={t('houses.name')} value={name} onChangeText={setName} />
      <Field label={t('houses.description')} value={description} onChangeText={setDescription} />
      <Button
        title={t('common.save')}
        onPress={() => update.mutate({ id: house.id, name: name.trim(), description: description.trim() })}
        loading={update.isPending}
        disabled={!name.trim()}
      />
      <Button style={{ marginTop: 10 }} variant="ghost" title={t('entryForm.delete')} onPress={confirmDelete} disabled={remove.isPending} />
    </View>
  );
}

export default function HouseDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: houses, isLoading } = useHouses();
  const [tab, setTab] = useState<Tab>('budget');
  const house = houses?.find((h) => h.id === id);
  const isOwner = !!house && house.userId === user?.id;

  return (
    <Screen>
      <Stack.Screen options={{ title: house?.name ?? t('houses.title') }} />
      {isLoading || !house ? (
        <Loading />
      ) : (
        <>
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'budget', label: t('houses.budgetTab') },
              { value: 'entries', label: t('houses.entriesTab') },
              { value: 'members', label: t('houses.membersTab') },
            ]}
          />
          <View style={{ height: 16 }} />
          {tab === 'budget' && <HouseBudgetView house={house} />}
          {tab === 'entries' && <EntriesTab house={house} />}
          {tab === 'members' && <MembersTab house={house} isOwner={isOwner} />}
          {isOwner && <Settings key={house.id} house={house} />}
        </>
      )}
    </Screen>
  );
}
