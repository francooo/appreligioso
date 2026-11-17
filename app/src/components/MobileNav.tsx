import { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii } from '../theme';
import { SECTIONS, activeSection } from './Sidebar';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, [IconName, IconName]> = {
  '/': ['home-outline', 'home'],
  '/leituras': ['book-outline', 'book'],
  '/orar': ['sunny-outline', 'sunny'],
  '/diario': ['create-outline', 'create'],
  '/perfil': ['person-outline', 'person'],
};

/** Abas inferiores do celular (e da web em janela estreita). */
export function BottomTabs() {
  const pathname = usePathname();
  const current = activeSection(pathname);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {SECTIONS.map((s) => {
        const active = s === current;
        const [outline, filled] = ICONS[s.href];
        return (
          <Link key={s.href} href={(s.subs[0]?.href ?? s.href) as never} asChild>
            <Pressable
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={s.label}
            >
              <Ionicons name={active ? filled : outline} size={22} color={active ? colors.navy : colors.muted} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{s.label}</Text>
              <View style={[styles.indicator, active && styles.indicatorActive]} />
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

/** Subpáginas da seção atual (ex.: Orações · Intenções · Lembretes) como pílulas no topo. */
export function SubTabs() {
  const pathname = usePathname();
  const current = activeSection(pathname);
  if (!current.subs.length) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subs} style={styles.subsBar}>
      {current.subs.map((sub) => {
        const active = pathname === sub.href;
        return (
          <Link key={sub.href} href={sub.href as never} asChild>
            <Pressable style={StyleSheet.flatten([styles.sub, active && styles.subActive])} accessibilityState={{ selected: active }}>
              <Text style={[styles.subText, active && styles.subTextActive]}>{sub.label}</Text>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 6,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  tabText: { fontFamily: fonts.medium, fontSize: 11, color: colors.muted },
  tabTextActive: { fontFamily: fonts.semibold, color: colors.navy },
  indicator: { width: 18, height: 3, borderRadius: 2, marginTop: 2, backgroundColor: 'transparent' },
  indicatorActive: { backgroundColor: colors.gold },
  subsBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.cardBorder, backgroundColor: colors.background },
  subs: { paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  sub: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.paper,
    justifyContent: 'center',
  },
  subActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  subText: { fontFamily: fonts.medium, fontSize: 13, color: colors.navy },
  subTextActive: { color: colors.white },
});
