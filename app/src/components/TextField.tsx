import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radii, shadows, sizes } from '../theme';

type Props = TextInputProps & {
  label?: string;
  /** Texto em cinza depois do rótulo, ex.: "(opcional)". */
  labelHint?: string;
  right?: ReactNode;
  hint?: string;
  error?: string | null;
  /** Campo de senha com o botão "Mostrar/Ocultar" do design system. */
  password?: boolean;
};

export function TextField({ label, labelHint, right, hint, error, password, style, onFocus, onBlur, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {labelHint ? <Text style={styles.labelHint}> {labelHint}</Text> : null}
        </Text>
      ) : null}
      <View style={[styles.box, focused && styles.focused, !!error && styles.errorBox]}>
        <TextInput
          placeholderTextColor={colors.placeholder}
          secureTextEntry={password && !visible}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {password ? (
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8} accessibilityRole="button">
            <Text style={styles.toggle}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        ) : null}
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy },
  labelHint: { fontFamily: fonts.regular, color: colors.muted },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: sizes.field,
    paddingHorizontal: 14,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radii.field,
  },
  focused: { borderColor: colors.gold, boxShadow: shadows.focus },
  errorBox: { borderColor: colors.danger },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.navy,
    outlineStyle: 'none',
  } as object,
  toggle: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  error: { fontFamily: fonts.regular, fontSize: 12, color: colors.danger },
});
