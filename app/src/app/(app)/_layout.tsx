import { Redirect, Slot } from 'expo-router';
import { AppShell } from '../../components/AppShell';
import { ToastProvider } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';

// Telas logadas (web e celular). A moldura escolhe sidebar (web larga) ou abas (celular).
export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/entrar" />;

  return (
    <ToastProvider>
      <AppShell>
        <Slot />
      </AppShell>
    </ToastProvider>
  );
}
