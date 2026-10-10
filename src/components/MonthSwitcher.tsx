import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Icon, Txt, useAccent } from '@/ui';
import { useTheme } from '@/theme/ThemeContext';

const MONTHS_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/**
 * ‹ Outubro 2026 › as a gray capsule. `compact` (next to a large title) shortens the month and drops
 * the year when it's the current one.
 */
export function MonthSwitcher({
  month,
  year,
  onChange,
  compact,
}: {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  compact?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const accent = useAccent();

  const shift = (delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    const next = new Date(year, month - 1 + delta, 1);
    onChange(next.getMonth() + 1, next.getFullYear());
  };

  const date = new Date(year, month - 1, 1);
  const longName = i18n.language === 'pt' ? MONTHS_PT[month - 1] : new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(date);
  const shortName = new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(date).replace('.', '');
  const showYear = !compact || year !== new Date().getFullYear();
  const label = `${compact ? shortName : longName}${showYear ? ` ${year}` : ''}`;

  // 44pt targets even though the capsule looks smaller: Apple's minimum touch size.
  const arrow = (delta: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={delta < 0 ? t('common.previousMonth') : t('common.nextMonth')}
      onPress={() => shift(delta)}
      hitSlop={8}
      style={({ pressed }) => ({ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}
    >
      <Icon sf={delta < 0 ? 'chevron.left' : 'chevron.right'} ion={delta < 0 ? 'chevron-back' : 'chevron-forward'} size={14} color={accent} weight="bold" />
    </Pressable>
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: compact ? 'auto' : 'center',
        backgroundColor: colors.fill,
        borderRadius: 100,
        paddingHorizontal: 2,
        marginBottom: compact ? 0 : 12,
      }}
    >
      {arrow(-1)}
      <Txt variant="small" style={{ fontWeight: '600', textTransform: 'capitalize', minWidth: compact ? 44 : 120, textAlign: 'center' }} accessibilityLiveRegion="polite">
        {label}
      </Txt>
      {arrow(1)}
    </View>
  );
}
