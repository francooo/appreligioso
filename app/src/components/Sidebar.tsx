import { Link, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, sizes } from '../theme';
import { SunLogo } from './SunLogo';
import { Avatar } from './ui';

type Section = { href: string; label: string; subs: { href: string; label: string }[] };

// Mesma estrutura do LuminaSidebar do design system.
export const SECTIONS: Section[] = [
  { href: '/', label: 'Início', subs: [] },
  {
    href: '/leituras',
    label: 'Leituras',
    subs: [
      { href: '/leituras/palavra', label: 'Palavra diária' },
      { href: '/leituras/planos', label: 'Planos de leitura' },
      { href: '/leituras/textos', label: 'Textos sagrados' },
    ],
  },
  {
    href: '/orar',
    label: 'Orar',
    subs: [
      { href: '/orar/oracoes', label: 'Orações' },
      { href: '/orar/intencoes', label: 'Intenções' },
      { href: '/orar/lembretes', label: 'Lembretes' },
    ],
  },
  {
    href: '/diario',
    label: 'Diário',
    subs: [
      { href: '/diario/gratidao', label: 'Gratidão' },
      { href: '/diario/historico', label: 'Histórico' },
    ],
  },
  {
    href: '/perfil',
    label: 'Perfil',
    subs: [
      { href: '/perfil/conta', label: 'Conta e configurações' },
      { href: '/perfil/salvos', label: 'Salvos' },
    ],
  },
];

export function activeSection(pathname: string) {
  return SECTIONS.find((s) => (s.href === '/' ? pathname === '/' : pathname.startsWith(s.href))) ?? SECTIONS[0];
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href as never} asChild>
      <Pressable
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={StyleSheet.flatten([styles.item, active ? styles.itemActive : hovered && styles.itemHover])}
      >
        <Text style={[styles.itemText, active && styles.itemTextActive]}>{label}</Text>
      </Pressable>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const current = activeSection(pathname);

  return (
    <View style={styles.sidebar}>
      <Link href="/" asChild>
        <Pressable style={styles.brand} accessibilityRole="link">
          <SunLogo size={34} />
          <Text style={styles.brandText}>Lumina</Text>
        </Pressable>
      </Link>

      {SECTIONS.map((s) => {
        const active = s === current;
        return (
          <View key={s.href} style={styles.group}>
            <NavItem href={s.subs[0]?.href ?? s.href} label={s.label} active={active} />
            {active &&
              s.subs.map((sub) => {
                const subActive = pathname === sub.href;
                return (
                  <Link key={sub.href} href={sub.href as never} asChild>
                    <Pressable style={StyleSheet.flatten([styles.sub, subActive && styles.subActive])}>
                      <Text style={[styles.subText, subActive && styles.subTextActive]}>{sub.label}</Text>
                    </Pressable>
                  </Link>
                );
              })}
          </View>
        );
      })}

      <View style={{ flex: 1 }} />

      <Link href="/perfil/conta" asChild>
        <Pressable style={styles.user}>
          <Avatar name={user?.name ?? user?.email} />
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name ?? 'Você'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: sizes.sidebar,
    height: '100%',
    backgroundColor: colors.sand,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
    paddingVertical: 28,
    paddingHorizontal: 18,
    gap: 4,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingBottom: 28 },
  brandText: { fontFamily: fonts.serif, fontSize: 26, color: colors.navy },
  group: { gap: 2 },
  item: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  itemHover: { backgroundColor: colors.sandHover },
  itemActive: { backgroundColor: colors.navy },
  itemText: { fontFamily: fonts.regular, fontSize: 15, color: colors.body },
  itemTextActive: { fontFamily: fonts.medium, color: colors.white },
  sub: { marginLeft: 22, paddingVertical: 7, paddingHorizontal: 12, borderLeftWidth: 2, borderLeftColor: '#EADFCD' },
  subActive: { borderLeftColor: colors.gold },
  subText: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  subTextActive: { fontFamily: fonts.semibold, color: colors.navy },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  userName: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy },
  userEmail: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
