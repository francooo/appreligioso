import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Dunes } from '../components/Dunes';
import { SunLogo } from '../components/SunLogo';
import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';

// Tela provisória pós-login, só para confirmar o fluxo de ponta a ponta.
export function HomeScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const firstName = user.name?.split(' ')[0] ?? user.email;

  return (
    <SafeAreaView style={styles.safe}>
      <Dunes />
      <View style={styles.content}>
        <SunLogo size={72} />
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : null}
        <Text style={styles.title}>Olá, {firstName}.</Text>
        <Text style={styles.subtitle}>Que bom ter você por aqui.</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.actions}>
          <Button title="Sair" variant="outline" onPress={signOut} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, marginTop: 24 },
  title: { fontFamily: fonts.serif, fontSize: 40, color: colors.navy, marginTop: 20, textAlign: 'center' },
  subtitle: { fontFamily: fonts.regular, fontSize: 17, color: colors.text, marginTop: 8 },
  email: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 16 },
  actions: { width: '100%', maxWidth: 320, marginTop: 32 },
});
