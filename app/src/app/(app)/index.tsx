import Head from 'expo-router/head';
import { Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Card, PageHeader } from '../../components/ui';
import { colors, type } from '../../theme';

// W5 · Home — conteúdo completo entra na Fase 2. Por enquanto confirma a moldura logada.
export default function HomeRoute() {
  const { user, signOut } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <>
      <Head>
        <title>Início · Lumina</title>
      </Head>
      <PageHeader eyebrow="Início" title={`Olá, ${firstName || 'bem-vinda(o)'}.`} />
      <Card style={{ gap: 16, maxWidth: 520 }}>
        <Text style={[type.body, { color: colors.body }]}>As novas telas do Lumina estão chegando por aqui.</Text>
        <Button title="Sair" variant="outline" onPress={signOut} style={{ alignSelf: 'flex-start' }} />
      </Card>
    </>
  );
}
