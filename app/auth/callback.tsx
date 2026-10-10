import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { brand } from '@/theme/ThemeContext';

/** Web only: where the server sends the browser after Google sign-in (the app uses zeno://auth/callback). */
export default function AuthCallback() {
  const { token, refreshToken } = useLocalSearchParams<{ token?: string; refreshToken?: string }>();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }
    login(token, undefined, refreshToken).then(() => router.replace('/'));
  }, [token, refreshToken, login, router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={brand.blue} />
    </View>
  );
}
