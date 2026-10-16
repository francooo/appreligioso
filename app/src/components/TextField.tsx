import { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Props = TextInputProps & {
  label: string;
  right?: ReactNode;
};

export function TextField({ label, right, style, ...inputProps }: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <TextInput
          placeholderTextColor={colors.placeholder}
          style={[styles.input, style]}
          {...inputProps}
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontFamily: fonts.medium, fontSize: 15, color: colors.navy },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius,
  },
  input: { flex: 1, height: '100%', fontFamily: fonts.regular, fontSize: 16, color: colors.navy },
});
