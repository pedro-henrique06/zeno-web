import { useState } from 'react';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Field, Segmented, Txt } from '@/ui';
import { AuthShell, GoogleButton, errorMessage } from '@/ui/AuthShell';
import { useLogin, useRegister } from '@/hooks/useAuth';
import type { Currency, Language } from '@/types';
import { brand } from '@/theme/ThemeContext';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [language, setLanguage] = useState<Language>('PtBR');
  const [error, setError] = useState('');
  const register = useRegister();
  const login = useLogin();

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    setError('');
    if (form.password !== form.confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }
    const email = form.email.trim();
    register.mutate(
      { name: form.name.trim(), email, password: form.password, confirmPassword: form.confirmPassword, currency, language },
      {
        // Registration does not return a session, so sign in right away.
        onSuccess: () => login.mutate({ email, password: form.password }),
        onError: (err) => setError(errorMessage(err, t('auth.register.genericError'))),
      },
    );
  };

  const busy = register.isPending || login.isPending;

  return (
    <AuthShell
      title={t('auth.register.welcome')}
      subtitle={t('auth.register.tagline')}
      footer={
        <Txt variant="small" muted>
          {t('auth.register.haveAccount')}{' '}
          <Link href="/login" style={{ color: brand.blue, fontWeight: '700' }}>
            {t('auth.register.login')}
          </Link>
        </Txt>
      }
    >
      {error ? (
        <Txt variant="small" color={brand.expense} style={{ marginBottom: 12 }}>
          {error}
        </Txt>
      ) : null}
      <Field label={t('auth.register.name')} value={form.name} onChangeText={set('name')} autoComplete="name" />
      <Field
        label={t('auth.register.email')}
        value={form.email}
        onChangeText={set('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Field label={t('auth.register.password')} value={form.password} onChangeText={set('password')} secureTextEntry textContentType="newPassword" />
      <Field
        label={t('auth.register.confirmPassword')}
        value={form.confirmPassword}
        onChangeText={set('confirmPassword')}
        secureTextEntry
        textContentType="newPassword"
      />
      <Txt variant="label" muted style={{ marginBottom: 6 }}>
        {t('auth.register.currency')}
      </Txt>
      <Segmented
        value={currency}
        onChange={setCurrency}
        options={(['BRL', 'USD', 'EUR'] as Currency[]).map((c) => ({ value: c, label: c }))}
      />
      <Txt variant="label" muted style={{ marginTop: 14, marginBottom: 6 }}>
        {t('auth.register.language')}
      </Txt>
      <Segmented
        value={language}
        onChange={setLanguage}
        options={(['PtBR', 'EnUS', 'Es'] as Language[]).map((l) => ({ value: l, label: t(`language.${l}`) }))}
      />
      <Button
        style={{ marginTop: 20 }}
        title={busy ? t('auth.register.submitting') : t('auth.register.submit')}
        onPress={submit}
        loading={busy}
        disabled={!form.name || !form.email || !form.password}
      />
      <GoogleButton label={t('auth.register.googleButton')} onError={setError} />
    </AuthShell>
  );
}
