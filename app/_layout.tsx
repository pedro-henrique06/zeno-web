import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import '@/i18n';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, brand, useTheme } from '@/theme/ThemeContext';
import { useHomeWidgetsSync } from '@/widgets/sync';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Gate() {
  const { isAuthenticated, ready } = useAuth();
  const { mode, colors } = useTheme();
  useHomeWidgetsSync();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const publicPage = {
    headerShown: true,
    title: '',
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
    headerStyle: { backgroundColor: colors.page },
    headerTintColor: mode === 'dark' ? brand.blue : brand.blueAction,
  };

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        {/* Public on purpose: reachable signed in or out; on web they are the App Store privacy and support URLs. */}
        <Stack.Screen name="privacidade" options={publicPage} />
        <Stack.Screen name="suporte" options={publicPage} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  // Interface text is SF Pro (system); only the Fraunces money face needs loading.
  const [fontsLoaded] = useFonts({ Fraunces_700Bold });
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <Gate />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
