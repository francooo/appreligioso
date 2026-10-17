import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export function OrDivider({ label = 'ou' }: { label?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.inputBorder },
  text: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
});
