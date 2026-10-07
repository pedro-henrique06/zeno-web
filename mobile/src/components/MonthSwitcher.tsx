import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Txt } from '@/ui';
import { useTheme } from '@/theme/ThemeContext';

const MONTHS_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export function MonthSwitcher({ month, year, onChange }: { month: number; year: number; onChange: (month: number, year: number) => void }) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  const shift = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    onChange(next.getMonth() + 1, next.getFullYear());
  };

  const label =
    i18n.language === 'pt'
      ? MONTHS_PT[month - 1]
      : new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(new Date(year, month - 1, 1));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('common.previousMonth')} hitSlop={12} onPress={() => shift(-1)}>
        <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
      </Pressable>
      <Txt variant="title" style={{ textTransform: 'capitalize' }}>
        {label} {year}
      </Txt>
      <Pressable accessibilityRole="button" accessibilityLabel={t('common.nextMonth')} hitSlop={12} onPress={() => shift(1)}>
        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}
