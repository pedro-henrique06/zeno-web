import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field, Loading, Screen, Segmented, Txt, ErrorState } from '@/ui';
import { useProfile, useUpdateCurrency, useUpdateLanguage, useUpdateProfile } from '@/hooks/useUser';
import type { Currency, Language, UserProfile } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

function ProfileForm({ profile }: { profile: UserProfile }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const update = useUpdateProfile();
  const updateCurrency = useUpdateCurrency();
  const updateLanguage = useUpdateLanguage();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  return (
    <>
      <Field label={t('editProfile.name')} value={name} onChangeText={setName} />
      <Field label={t('editProfile.email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Txt variant="label" muted style={{ marginBottom: 6 }}>
        {t('editProfile.currency')}
      </Txt>
      <Segmented
        value={profile.currency}
        onChange={(currency: Currency) => updateCurrency.mutate({ currency })}
        options={(['BRL', 'USD', 'EUR'] as Currency[]).map((c) => ({ value: c, label: t(`currency.${c}`) }))}
      />
      <Txt variant="label" muted style={{ marginTop: 14, marginBottom: 6 }}>
        {t('editProfile.language')}
      </Txt>
      <Segmented
        value={profile.language}
        onChange={(language: Language) => updateLanguage.mutate({ language })}
        options={(['PtBR', 'EnUS', 'Es'] as Language[]).map((l) => ({ value: l, label: t(`language.${l}`) }))}
      />
      {update.isError && (
        <Txt variant="small" color={colors.expense} style={{ marginTop: 12 }}>
          {t('auth.register.genericError')}
        </Txt>
      )}
      <Button
        style={{ marginTop: 20 }}
        title={t('editProfile.save')}
        loading={update.isPending}
        disabled={!name.trim() || !email.trim()}
        onPress={() => update.mutate({ name: name.trim(), email: email.trim() })}
      />
    </>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  return (
    <Screen>
      {isLoading ? (
        <Loading />
      ) : isError || !profile ? (
        <ErrorState message={t('editProfile.loadError')} onRetry={refetch} />
      ) : (
        <ProfileForm profile={profile} />
      )}
    </Screen>
  );
}
