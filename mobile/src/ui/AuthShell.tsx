import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Txt } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { loginWithGoogle } from '@/lib/googleLogin';
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

/** "Continue with Google": runs the browser flow and signs the user in with the returned tokens. */
export function GoogleButton({ label, onError }: { label: string; onError: (message: string) => void }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const result = await loginWithGoogle();
      if (result.ok) await login(result.token, undefined, result.refreshToken);
      else if (!result.cancelled) onError(t('auth.login.genericError'));
    } catch {
      onError(t('auth.login.genericError'));
    } finally {
      setBusy(false);
    }
  };

  return <Button variant="secondary" icon="logo-google" title={label} onPress={run} loading={busy} style={{ marginTop: 12 }} />;
}
