import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TRADITIONS, TRADITION_KEYS, TraditionKey } from '../content/traditions';
import { colors, fonts, radii, shadows } from '../theme';
import { SunLogo } from './SunLogo';

type Props = {
  value: string | null | undefined;
  onChange: (key: TraditionKey) => void;
  /** "pill" = cabeçalho da Home; "field" = campo de formulário (cadastro). */
  variant?: 'pill' | 'field';
  placeholder?: string;
  disabled?: boolean;
};

export function TraditionSelect({ value, onChange, variant = 'pill', placeholder = 'Selecione, se quiser', disabled }: Props) {
  const [open, setOpen] = useState(false);
  const current = value ? TRADITIONS[value as TraditionKey] : null;

  return (
    <View style={[styles.wrap, open && styles.wrapOpen]}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={variant === 'pill' ? styles.pill : styles.field}
      >
        {variant === 'pill' ? (
          <>
            <View style={styles.sunBadge}>
              <SunLogo size={18} />
            </View>
            <Text style={styles.pillLabel}>
              Minha tradição: <Text style={styles.pillValue}>{current?.name ?? 'Escolher'}</Text>
            </Text>
          </>
        ) : (
          <Text style={[styles.fieldText, !current && styles.placeholder]}>{current?.name ?? placeholder}</Text>
        )}
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.text} />
      </Pressable>

      {open && (
        <View style={[styles.menu, variant === 'field' && styles.menuField]}>
          {TRADITION_KEYS.map((k) => (
            <Pressable
              key={k}
              onPress={() => {
                setOpen(false);
                if (k !== value) onChange(k);
              }}
              style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [styles.option, hovered && styles.optionHover]}
            >
              <Text style={[styles.optionText, k === value && styles.optionActive]}>{TRADITIONS[k].name}</Text>
              {k === value && <Ionicons name="checkmark" size={16} color={colors.gold} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', zIndex: 1 },
  wrapOpen: { zIndex: 50 },
  pill: {
    height: 44,
    paddingLeft: 6,
    paddingRight: 16,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.paper,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sunBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  pillValue: { fontFamily: fonts.semibold, color: colors.navy },
  field: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldText: { fontFamily: fonts.regular, fontSize: 15, color: colors.navy },
  placeholder: { color: colors.placeholder },
  menu: {
    position: 'absolute',
    top: 50,
    left: 0,
    minWidth: 240,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingVertical: 6,
    boxShadow: shadows.popover,
  },
  menuField: { right: 0 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionHover: { backgroundColor: colors.sand },
  optionText: { fontFamily: fonts.regular, fontSize: 14, color: colors.body },
  optionActive: { fontFamily: fonts.semibold, color: colors.navy },
});
