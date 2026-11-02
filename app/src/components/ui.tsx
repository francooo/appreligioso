import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Switch, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, fonts, radii, shadows, type } from '../theme';

// Primitivos visuais do design system Lumina, usados em várias telas.

export function Eyebrow({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.eyebrow, style]}>{typeof children === 'string' ? children.toUpperCase() : children}</Text>;
}

export function PageHeader({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: ReactNode }) {
  return (
    <View style={styles.pageHeader}>
      <View style={{ gap: 6, flexShrink: 1 }}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Text style={styles.pageTitle}>{title}</Text>
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

export function Card({
  children,
  style,
  padded = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  return <View style={[styles.card, padded && styles.cardPadding, style]}>{children}</View>;
}

/** Card de destaque em azul-marinho (ex.: "Momento de oração"). */
export function HighlightCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.highlight, style]}>{children}</View>;
}

export function Chip({
  label,
  active,
  onPress,
  tone = 'default',
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tone?: 'default' | 'tag';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected: !!active }}
      style={[styles.chip, tone === 'tag' && styles.tag, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, tone === 'tag' && styles.tagText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <View style={styles.pills}>
      {options.map((o) => (
        <Chip key={o.key} label={o.label} active={o.key === value} onPress={() => onChange(o.key)} />
      ))}
    </View>
  );
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: '#E6DCCD', true: colors.navy }}
      thumbColor={colors.white}
      {...({ activeThumbColor: colors.white } as object)}
    />
  );
}

export function ProgressBar({ value, style }: { value: number; style?: StyleProp<ViewStyle> }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.track, style]}>
      <View style={[styles.fill, { width: `${pct}%` }]} />
    </View>
  );
}

export function Avatar({ name, size = 34 }: { name?: string | null; size?: number }) {
  const initials =
    (name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '·';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: Math.round(size * 0.38) }]}>{initials}</Text>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  eyebrow: { ...type.eyebrow, color: colors.goldText },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 },
  pageTitle: { ...type.title, color: colors.title },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.card,
    boxShadow: shadows.card,
  },
  cardPadding: { padding: 24 },
  highlight: { backgroundColor: colors.navy, borderRadius: radii.card, padding: 24 },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  tag: { height: 26, paddingHorizontal: 10, backgroundColor: colors.peach, borderColor: colors.peach },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.navy },
  chipTextActive: { color: colors.white },
  tagText: { fontSize: 12, color: colors.tagText },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.divider, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2, backgroundColor: colors.gold },
  avatar: { backgroundColor: '#F3DCC0', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.semibold, color: colors.navy },
  divider: { height: 1, backgroundColor: colors.divider },
});
