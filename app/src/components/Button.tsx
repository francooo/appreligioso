import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fonts, radii, sizes } from '../theme';

type Variant = 'primary' | 'outline' | 'tertiary' | 'link' | 'danger';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'sm';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  style,
}: Props) {
  const inactive = disabled || loading;
  const text = variant === 'primary' ? colors.white : variant === 'danger' ? colors.danger : colors.navy;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.base,
        size === 'sm' && styles.sm,
        styles[variant],
        hovered && !inactive && hoverStyles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, size === 'sm' && styles.smText, { color: text }, variant === 'link' && styles.linkText]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: sizes.button,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sm: { height: 34, paddingHorizontal: 14 },
  primary: { backgroundColor: colors.navy },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.navy },
  tertiary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.inputBorder },
  link: { height: 'auto', paddingHorizontal: 0, alignSelf: 'flex-start' },
  danger: { height: 'auto', paddingHorizontal: 0, alignSelf: 'flex-start' },
  pressed: { opacity: 0.85 },
  disabled: { backgroundColor: '#8D9AAE', borderColor: '#8D9AAE' },
  text: { fontFamily: fonts.semibold, fontSize: 16 },
  smText: { fontFamily: fonts.medium, fontSize: 13 },
  linkText: { fontFamily: fonts.medium },
});

const hoverStyles = StyleSheet.create({
  primary: { backgroundColor: '#264A75' },
  outline: { backgroundColor: colors.sand },
  tertiary: { backgroundColor: colors.sand },
  link: { opacity: 0.8 },
  danger: { opacity: 0.8 },
});
