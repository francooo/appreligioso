import { useEffect } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SourceSerif4_500Medium, SourceSerif4_600SemiBold } from '@expo-google-fonts/source-serif-4';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { checkApiDatabase } from '../lib/api';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SourceSerif4_500Medium,
    SourceSerif4_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  useEffect(() => {
    if (__DEV__) checkApiDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator fontsLoaded={fontsLoaded} />
        </AuthProvider>
      </QueryClientProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { restoring } = useAuth();
  const ready = fontsLoaded && !restoring;

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!ready) return null;

  // Cada grupo redireciona no próprio _layout: (app) exige sessão, (auth) exige não ter.
  // Assim um link direto (ex.: /orar/intencoes sem login) cai em /entrar em vez de 404.
  return <Stack screenOptions={{ headerShown: false }} />;
}
