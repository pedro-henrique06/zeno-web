import { useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Txt } from '@/ui';
import { brand, useTheme } from '@/theme/ThemeContext';

/** A selectable value with a copy button, for what the user pastes into Shortcuts / Scriptable. */
export function CopyField({ label, value, multiline }: { label?: string; value: string; multiline?: boolean }) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <View style={{ marginBottom: 10 }}>
      {label ? (
        <Txt variant="label" muted style={{ marginBottom: 4 }}>
          {label}
        </Txt>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingLeft: 12,
          paddingRight: 4,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.divider,
          backgroundColor: colors.hover,
        }}
      >
        <Txt
          variant="caption"
          selectable
          numberOfLines={multiline ? 6 : 1}
          style={{ flex: 1, paddingVertical: 10, fontFamily: undefined }}
        >
          {value}
        </Txt>
        <Pressable accessibilityRole="button" accessibilityLabel={`${label ?? ''} copy`} hitSlop={8} onPress={copy} style={{ padding: 8 }}>
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={20} color={copied ? brand.income : colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}
