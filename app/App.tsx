import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { checkApiDatabase } from './src/lib/api';

SplashScreen.preventAutoHideAsync();

function Root({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { user, restoring } = useAuth();
  const ready = fontsLoaded && !restoring;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  return user ? <HomeScreen /> : <LoginScreen />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (__DEV__) checkApiDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root fontsLoaded={fontsLoaded} />
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
