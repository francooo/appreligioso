import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors } from '../theme';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

const DESKTOP_MIN_WIDTH = 1024;

/** Moldura das telas logadas na web: sidebar + área de conteúdo rolável. */
export function AppShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const desktop = width >= DESKTOP_MIN_WIDTH;

  return (
    <View style={[styles.root, !desktop && styles.column]}>
      {desktop ? <Sidebar /> : <TopNav />}
      <ScrollView style={styles.main} contentContainerStyle={[styles.content, !desktop && styles.contentNarrow]}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.background, height: '100%' },
  column: { flexDirection: 'column' },
  main: { flex: 1 },
  content: { paddingHorizontal: 44, paddingTop: 36, paddingBottom: 48, gap: 24, maxWidth: 1180, width: '100%' },
  contentNarrow: { paddingHorizontal: 20, paddingTop: 24 },
});
