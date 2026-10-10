import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Icon, Row, Screen, Section, Txt } from '@/ui';
import { useLogout, useResetAccount } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { brand, useTheme } from '@/theme/ThemeContext';

/** Settings-app palette for the icon squares: each row gets its own hue, like iOS Settings. */
const TINT = {
  blue: brand.blueAction,
  orange: '#C26A00',
  green: '#1E8E4E',
  purple: '#7A4FD6',
  teal: '#1F7A77',
  gray: '#636366',
  pink: '#C2335B',
};

function initials(name?: string) {
  return (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function MenuScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
    <Screen title={t('menu.title')}>
      {/* Apple ID-style card: avatar with initials, name, email, opens the profile. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${user?.name ?? ''}, ${t('menu.editProfile')}`}
        onPress={() => router.push('/profile')}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 14,
          borderRadius: 22,
          borderCurve: 'continuous',
          backgroundColor: pressed ? colors.raised : colors.paper,
        })}
      >
        <View style={{ width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.blueAction }}>
          <Txt variant="title" color="#fff" style={{ fontWeight: '600' }}>
            {initials(user?.name) || '?'}
          </Txt>
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="title" numberOfLines={1}>
            {user?.name}
          </Txt>
          <Txt variant="caption" muted numberOfLines={1}>
            {user?.email}
          </Txt>
        </View>
        <Icon sf="chevron.right" ion="chevron-forward" size={13} color={colors.textDisabled} />
      </Pressable>

      <Section>
        <Row sf="speedometer" icon="speedometer" tint={TINT.orange} title={t('menu.dailyBudget')} subtitle={t('menu.dailyBudgetHint')} onPress={() => router.push('/daily-budget')} />
        <Row sf="flag.fill" icon="flag" tint={TINT.green} title={t('menu.goals')} subtitle={t('menu.goalsHint')} onPress={() => router.push('/goals')} />
        <Row sf="tag.fill" icon="pricetag" tint={TINT.purple} title={t('categories.title')} onPress={() => router.push('/tags')} />
        <Row sf="house.fill" icon="home" tint={TINT.teal} title={t('menu.houses')} subtitle={t('menu.housesHint')} onPress={() => router.push('/houses')} last />
      </Section>

      <Section>
        <Row sf="wallet.bifold.fill" icon="wallet" tint={TINT.pink} title={t('capture.item')} subtitle={t('capture.itemHint')} onPress={() => router.push('/iphone')} />
        <Row sf="gearshape.fill" icon="settings" tint={TINT.gray} title={t('menu.settings')} onPress={() => router.push('/settings')} last />
      </Section>

      <Section>
        <Row sf="arrow.counterclockwise" icon="refresh" title={t('menu.resetAccount')} danger onPress={confirmReset} />
        <Row sf="rectangle.portrait.and.arrow.right" icon="log-out" title={t('menu.logout')} danger onPress={() => logout.mutate()} last />
      </Section>

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Txt variant="caption" muted>
          {t('menu.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
        </Txt>
      </View>
    </Screen>
  );
}
