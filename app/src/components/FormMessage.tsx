import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme';

/** Mensagem do formulário de login: erro (vermelho) ou aviso (neutro). Funciona na web, ao contrário de Alert. */
export function FormMessage({ error, notice }: { error?: string | null; notice?: string | null }) {
  const text = error ?? notice;
  if (!text) return null;
  return (
    <View style={[styles.box, error ? styles.error : styles.notice]} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={[styles.text, error ? { color: colors.danger } : null]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radii.field, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },
  error: { backgroundColor: '#FBEDE8', borderColor: '#F0C9BD' },
  notice: { backgroundColor: colors.sand, borderColor: colors.cardBorder },
  text: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.body },
});
