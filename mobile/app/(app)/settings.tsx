import { Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Row, Screen, Section } from '@/ui';
import { brand, useTheme } from '@/theme/ThemeContext';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useTheme();
  return (
    <Screen>
      <Section title={t('settings.sectionAppearance')}>
        <Row
          last
          icon={mode === 'dark' ? 'moon-outline' : 'sunny-outline'}
          title={mode === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
          right={<Switch value={mode === 'dark'} onValueChange={toggleTheme} trackColor={{ true: brand.blue }} />}
        />
      </Section>
    </Screen>
  );
}
