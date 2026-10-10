import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { brand, fonts, useTheme } from '@/theme/ThemeContext';

type IconName = keyof typeof Ionicons.glyphMap;

export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const tab = (name: string, title: string, icon: IconName, focused: IconName) => (
    <Tabs.Screen
      name={name}
      options={{
        title,
        tabBarIcon: ({ color, size, focused: isFocused }) => <Ionicons name={isFocused ? focused : icon} size={size} color={color} />,
      }}
    />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand.blue,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.nav, borderTopColor: colors.divider },
      }}
    >
      {tab('index', t('appLayout.balances'), 'wallet-outline', 'wallet')}
      {tab('totais', t('appLayout.totals'), 'pie-chart-outline', 'pie-chart')}
      {tab('entries', t('appLayout.entries'), 'list-outline', 'list')}
      {tab('tags', t('appLayout.tags'), 'pricetags-outline', 'pricetags')}
      {tab('menu', t('appLayout.menu'), 'menu-outline', 'menu')}
    </Tabs>
  );
}
