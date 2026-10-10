import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { brand, useTheme } from '@/theme/ThemeContext';

/**
 * The system tab bar: on iOS 26 it is Liquid Glass, shrinks while scrolling down, and the "search"
 * role puts the last item in its own round glass button on the right. That slot is "+" (new entry).
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const tint = colors.mode === 'dark' ? brand.blue : brand.blueAction;

  return (
    <NativeTabs tintColor={tint} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.line.uptrend.xyaxis', selected: 'chart.line.uptrend.xyaxis' }} md="show_chart" />
        <NativeTabs.Trigger.Label>{t('appLayout.balances')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="totais">
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.pie', selected: 'chart.pie.fill' }} md="pie_chart" />
        <NativeTabs.Trigger.Label>{t('appLayout.totals')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="entries">
        <NativeTabs.Trigger.Icon sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }} md="receipt_long" />
        <NativeTabs.Trigger.Label>{t('appLayout.entries')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="menu">
        <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} md="account_circle" />
        <NativeTabs.Trigger.Label>{t('appLayout.menu')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="new" role="search" accessibilityLabel={t('entryForm.newTitle')}>
        <NativeTabs.Trigger.Icon sf="plus" md="add" />
        <NativeTabs.Trigger.Label>{t('entryForm.newTitle')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
