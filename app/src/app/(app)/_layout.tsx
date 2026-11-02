import { Platform } from 'react-native';
import { Redirect, Slot } from 'expo-router';
import { AppShell } from '../../components/AppShell';
import { useAuth } from '../../context/AuthContext';
import { HomeScreen } from '../../screens/HomeScreen';

// Telas logadas. Nesta etapa só a web recebe as telas novas (sidebar + W5–W15);
// no Android/iOS continua a Home provisória.
export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/entrar" />;

  if (Platform.OS !== 'web') return <HomeScreen />;

  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
