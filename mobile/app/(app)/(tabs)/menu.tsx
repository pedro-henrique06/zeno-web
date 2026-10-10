import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Card, Row, Screen, Section, Txt } from '@/ui';
import { useLogout, useResetAccount } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';

export default function MenuScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const logout = useLogout();
  const reset = useResetAccount();

  const confirmReset = () =>
    Alert.alert(t('menu.resetAccountTitle'), `${t('menu.resetAccountWarning')}\n\n${t('menu.resetAccountInfo')}`, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('menu.resetAccount'), style: 'destructive', onPress: () => reset.mutate() },
    ]);

  return (
    <Screen>
      <Txt variant="heading">{t('menu.title')}</Txt>
      <Card style={{ marginTop: 14 }}>
        <Txt variant="title">{user?.name}</Txt>
        <Txt variant="small" muted>
          {user?.email}
        </Txt>
      </Card>

      <Section>
        <Row icon="person-outline" title={t('menu.editProfile')} onPress={() => router.push('/profile')} />
        <Row icon="speedometer-outline" title={t('menu.dailyBudget')} subtitle={t('menu.dailyBudgetHint')} onPress={() => router.push('/daily-budget')} />
        <Row icon="home-outline" title={t('menu.houses')} subtitle={t('menu.housesHint')} onPress={() => router.push('/houses')} />
        <Row icon="flag-outline" title={t('menu.goals')} subtitle={t('menu.goalsHint')} onPress={() => router.push('/goals')} />
        <Row icon="phone-portrait-outline" title={t('capture.item')} subtitle={t('capture.itemHint')} onPress={() => router.push('/iphone')} />
        <Row icon="settings-outline" title={t('menu.settings')} onPress={() => router.push('/settings')} last />
      </Section>

      <Section>
        <Row icon="refresh-outline" title={t('menu.resetAccount')} danger onPress={confirmReset} />
        <Row icon="log-out-outline" title={t('menu.logout')} danger onPress={() => logout.mutate()} last />
      </Section>

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Txt variant="caption" muted>
          {t('menu.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
        </Txt>
      </View>
    </Screen>
  );
}
