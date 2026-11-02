import { Link, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { SECTIONS, activeSection } from './Sidebar';
import { SunLogo } from './SunLogo';

/** Navegação compacta para janelas estreitas (< 1024 px), já que o mockup só define desktop. */
export function TopNav() {
  const pathname = usePathname();
  const current = activeSection(pathname);

  return (
    <View style={styles.bar}>
      <View style={styles.brand}>
        <SunLogo size={26} />
        <Text style={styles.brandText}>Lumina</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {SECTIONS.map((s) => (
          <Link key={s.href} href={(s.subs[0]?.href ?? s.href) as never} asChild>
            <Pressable style={StyleSheet.flatten([styles.item, s === current && styles.itemActive])}>
              <Text style={[styles.itemText, s === current && styles.itemTextActive]}>{s.label}</Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
      {current.subs.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {current.subs.map((sub) => (
            <Link key={sub.href} href={sub.href as never} asChild>
              <Pressable style={StyleSheet.flatten([styles.sub, pathname === sub.href && styles.subActive])}>
                <Text style={[styles.subText, pathname === sub.href && styles.subTextActive]}>{sub.label}</Text>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.sand,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontFamily: fonts.serif, fontSize: 22, color: colors.navy },
  row: { gap: 6 },
  item: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  itemActive: { backgroundColor: colors.navy },
  itemText: { fontFamily: fonts.regular, fontSize: 14, color: colors.body },
  itemTextActive: { fontFamily: fonts.medium, color: colors.white },
  sub: { paddingVertical: 4, paddingHorizontal: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  subActive: { borderBottomColor: colors.gold },
  subText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text },
  subTextActive: { fontFamily: fonts.semibold, color: colors.navy },
});
