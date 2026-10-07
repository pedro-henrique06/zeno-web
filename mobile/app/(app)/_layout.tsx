import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useUser';
import { LANGUAGE_TO_I18N } from '@/i18n';
import { fonts, useTheme } from '@/theme/ThemeContext';

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (profile?.language) i18n.changeLanguage(LANGUAGE_TO_I18N[profile.language]);
  }, [profile?.language, i18n]);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.page },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.bold },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.page },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: t('editProfile.title') }} />
      <Stack.Screen name="daily-budget" options={{ title: t('dailyBudget.title') }} />
      <Stack.Screen name="goals" options={{ title: t('menu.goals') }} />
      <Stack.Screen name="houses/index" options={{ title: t('houses.title') }} />
      <Stack.Screen name="houses/[id]" options={{ title: t('houses.title') }} />
      <Stack.Screen name="horizon" options={{ title: t('dashboard.title') }} />
      <Stack.Screen name="iphone" options={{ title: t('widget.section') }} />
      <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
    </Stack>
  );
}
