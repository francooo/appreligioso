import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLayout } from '../lib/responsive';
import { colors } from '../theme';
import { BottomTabs, SubTabs } from './MobileNav';
import { Sidebar } from './Sidebar';

/**
 * Moldura das telas logadas.
 * - Web ≥ 1024 px: sidebar do mockup + conteúdo rolável.
 * - Celular (app nativo) e web estreita: subpáginas no topo, conteúdo rolável e abas embaixo.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { isDesktop } = useLayout();

  if (isDesktop) {
    return (
      <View style={styles.root}>
        <Sidebar />
        <ScrollView style={styles.main} contentContainerStyle={styles.content}>
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.mobile}>
      <SubTabs />
      <KeyboardAvoidingView style={styles.main} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.main}
          contentContainerStyle={styles.mobileContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomTabs />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.background, height: '100%' },
  main: { flex: 1 },
  content: { paddingHorizontal: 44, paddingTop: 36, paddingBottom: 48, gap: 24, maxWidth: 1180, width: '100%' },
  mobile: { flex: 1, backgroundColor: colors.background },
  mobileContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 20, maxWidth: 760, width: '100%', alignSelf: 'center' },
});
