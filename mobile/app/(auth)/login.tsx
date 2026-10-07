import { useState } from 'react';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Field, Txt } from '@/ui';
import { AuthShell, GoogleButton, errorMessage } from '@/ui/AuthShell';
import { useLogin } from '@/hooks/useAuth';
import { brand } from '@/theme/ThemeContext';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useLogin();

  const submit = () => {
    setError('');
    login.mutate(
      { email: email.trim(), password },
      { onError: (err) => setError(errorMessage(err, t('auth.login.genericError'))) },
    );
  };

  return (
    <AuthShell
      title={t('auth.login.welcome')}
      subtitle={t('auth.login.tagline')}
      footer={
        <Txt variant="small" muted>
          {t('auth.login.noAccount')}{' '}
          <Link href="/register" style={{ color: brand.blue, fontWeight: '700' }}>
            {t('auth.login.createAccount')}
          </Link>
        </Txt>
      }
    >
      {error ? (
        <Txt variant="small" color={brand.expense} style={{ marginBottom: 12 }}>
          {error}
        </Txt>
      ) : null}
      <Field
        label={t('auth.login.email')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="username"
      />
      <Field
        label={t('auth.login.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        onSubmitEditing={submit}
      />
      <Button
        title={login.isPending ? t('auth.login.submitting') : t('auth.login.submit')}
        onPress={submit}
        loading={login.isPending}
        disabled={!email || !password}
      />
      <GoogleButton label={t('auth.login.googleButton')} onError={setError} />
    </AuthShell>
  );
}
