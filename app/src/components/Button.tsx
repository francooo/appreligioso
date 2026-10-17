import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline';
};

export function Button({ title, onPress, variant = 'primary' }: Props) {
  const outline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.base, outline ? styles.outline : styles.primary, pressed && styles.pressed]}
    >
      <Text style={[styles.text, outline && styles.outlineText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.navy },
  outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.navy },
  pressed: { opacity: 0.85 },
  text: { fontFamily: fonts.medium, fontSize: 17, color: colors.white, letterSpacing: 0.3 },
  outlineText: { color: colors.navy },
});
