import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { LoginScreen } from './src/screens/LoginScreen';
import { checkApiDatabase } from './src/lib/api';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSerifDisplay_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (__DEV__) checkApiDatabase();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <LoginScreen />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
