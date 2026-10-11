import { useEffect, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Txt } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { loginWithGoogle } from '@/lib/googleLogin';
import { loginWithApple } from '@/api/auth';
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

/**
 * Sign in with Apple, using Apple's own button (its look is required by the Human Interface
 * Guidelines). iOS only: it renders nothing where the native sheet isn't available.
 */
export function AppleButton({ mode, onError }: { mode: 'signIn' | 'signUp'; onError: (message: string) => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { login } = useAuth();
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAvailable).catch(() => setAvailable(false));
  }, []);

  if (!available) return null;

  const run = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      if (!credential.identityToken) return onError(t('auth.login.genericError'));
      // Apple hands over the name only on the first sign-in, so it travels with the token.
      const fullName = credential.fullName ? AppleAuthentication.formatFullName(credential.fullName) : undefined;
      const result = await loginWithApple(credential.identityToken, fullName || undefined, credential.authorizationCode);
      await login(result.token, { id: result.userId, name: result.name, email: result.email }, result.refreshToken);
    } catch (err) {
      if ((err as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return;
      onError(errorMessage(err, t('auth.login.genericError')));
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={mode === 'signUp' ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={colors.mode === 'dark' ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={25}
      style={{ height: 50, marginTop: 12 }}
      onPress={run}
    />
  );
}
