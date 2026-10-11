import { useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Field, Txt, useAccent } from '@/ui';
import { AuthShell, errorMessage } from '@/ui/AuthShell';
import { forgotPassword, resetPassword } from '@/api/auth';
import { useTheme } from '@/theme/ThemeContext';

const RESEND_SECONDS = 60;

/**
 * "Esqueci minha senha" in two steps: email → a 6-digit code arrives by email → code + new password.
 * The server answers the same whether or not the email has an account, and so does this screen.
 */
export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const accent = useAccent();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [wait, setWait] = useState(0);

  // Countdown for "Reenviar código", matching the server's 60s cooldown.
  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const send = async () => {
    setError('');
    setBusy(true);
    try {
      await forgotPassword(email.trim());
      setStep('code');
      setWait(RESEND_SECONDS);
    } catch (err) {
      setError(errorMessage(err, t('auth.forgot.sendError')));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setError('');
    setBusy(true);
    try {
      await resetPassword({ email: email.trim(), code, newPassword: password, confirmNewPassword: confirm });
      Alert.alert(t('auth.forgot.doneTitle'), t('auth.forgot.doneMessage'));
      router.replace({ pathname: '/login' });
    } catch (err) {
      setError(errorMessage(err, t('auth.forgot.resetError')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.forgot.title')}
      subtitle={step === 'email' ? t('auth.forgot.emailHint') : t('auth.forgot.codeHint', { email: email.trim() })}
      footer={
        <Link href="/login" style={{ color: accent, fontWeight: '600' }}>
          {t('auth.forgot.backToLogin')}
        </Link>
      }
    >
      {error ? (
        <Txt variant="small" color={colors.expense} style={{ marginBottom: 12 }}>
          {error}
        </Txt>
      ) : null}

      {step === 'email' ? (
        <>
          <Field
            label={t('auth.login.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="username"
            placeholder={t('auth.login.emailPlaceholder')}
            autoFocus={!email}
            onSubmitEditing={send}
          />
          <Button title={t('auth.forgot.send')} onPress={send} loading={busy} disabled={!email.trim()} />
        </>
      ) : (
        <>
          <Field
            label={t('auth.forgot.code')}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            autoFocus
          />
          <Field
            label={t('auth.forgot.newPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            autoComplete="password-new"
            placeholder={t('auth.forgot.passwordRules')}
            trailing={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                onPress={() => setShowPassword((v) => !v)}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
              </Pressable>
            }
          />
          <Field
            label={t('auth.forgot.confirmPassword')}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            autoComplete="password-new"
            onSubmitEditing={reset}
          />
          <Button
            title={t('auth.forgot.reset')}
            onPress={reset}
            loading={busy}
            disabled={code.length !== 6 || !password || !confirm}
          />
          <Button
            variant="ghost"
            title={wait > 0 ? t('auth.forgot.resendIn', { seconds: wait }) : t('auth.forgot.resend')}
            onPress={send}
            disabled={wait > 0 || busy}
            style={{ marginTop: 6 }}
          />
          <Button
            variant="ghost"
            title={t('auth.forgot.otherEmail')}
            onPress={() => (setStep('email'), setCode(''), setError(''))}
            style={{ marginTop: 0 }}
          />
        </>
      )}
    </AuthShell>
  );
}
