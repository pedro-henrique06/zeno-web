import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '@/ui';
import { brand, useTheme } from '@/theme/ThemeContext';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.auth }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={{ marginBottom: 28 }}>
            <Txt variant="label" color={brand.blue} style={{ marginBottom: 10 }}>
              Zeno
            </Txt>
            <Txt variant="heading" style={{ fontSize: 34 }}>
              {title}
            </Txt>
            <Txt variant="body" muted style={{ marginTop: 6 }}>
              {subtitle}
            </Txt>
          </View>
          {children}
          <View style={{ marginTop: 24, alignItems: 'center' }}>{footer}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function errorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  if (Array.isArray(data)) return data.map((e) => (e as { error?: string }).error).filter(Boolean).join(', ') || fallback;
  const msg = data as { message?: string; error?: string } | undefined;
  return msg?.message || msg?.error || fallback;
}
