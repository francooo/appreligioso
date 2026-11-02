import Head from 'expo-router/head';
import { Link, usePathname } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { activeSection } from '../../components/Sidebar';
import { Card, PageHeader } from '../../components/ui';
import { colors, fonts, type } from '../../theme';

// Seções das próximas fases (Leituras, Orar, Diário) e endereços desconhecidos.
export default function EmBreve() {
  const pathname = usePathname();
  const section = activeSection(pathname);
  const sub = section.subs.find((s) => s.href === pathname);
  const known = section.href !== '/' || pathname === '/';

  return (
    <>
      <Head>
        <title>{`${sub?.label ?? section.label} · Lumina`}</title>
      </Head>
      <PageHeader eyebrow={known ? section.label : 'Lumina'} title={sub?.label ?? (known ? section.label : 'Página não encontrada')} />
      <Card style={styles.card}>
        <Text style={styles.text}>
          {known ? 'Esta parte do Lumina está sendo preparada e chega em breve.' : 'Não encontramos este endereço.'}
        </Text>
        <Link href="/" style={styles.link}>
          Voltar ao início →
        </Link>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, maxWidth: 560 },
  text: { ...type.body, color: colors.body },
  link: { fontFamily: fonts.medium, fontSize: 15, color: colors.navy },
});
