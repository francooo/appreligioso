import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTradition } from '../lib/queries';
import { colors, fonts, radii, shadows } from '../theme';

type Result = { label: string; kind: string; href: string };

/** Busca no conteúdo da tradição (orações, planos, textos), com resultados num menu. */
export function SearchBox({ placeholder = 'Buscar passagens, orações…', width = 258 }: { placeholder?: string; width?: number }) {
  const rel = useTradition();
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);

  const results = useMemo<Result[]>(() => {
    const term = normalize(q);
    if (term.length < 2) return [];
    const all: Result[] = [
      { label: rel.verse.replace(/[“”]/g, ''), kind: rel.ref, href: '/leituras/palavra' },
      ...[...rel.prayers, ...rel.library].map((p) => ({ label: p, kind: 'Oração', href: '/orar/oracoes' })),
      ...rel.plans.map(([p]) => ({ label: p, kind: 'Plano de leitura', href: '/leituras/planos' })),
      ...rel.sections.map((s) => ({ label: s, kind: rel.book, href: '/leituras/textos' })),
    ];
    const seen = new Set<string>();
    return all
      .filter((r) => normalize(r.label).includes(term) || normalize(r.kind).includes(term))
      .filter((r) => (seen.has(r.label) ? false : (seen.add(r.label), true)))
      .slice(0, 6);
  }, [q, rel]);

  const open = focused && q.trim().length >= 2;

  return (
    <View style={[styles.wrap, { width }, open && styles.wrapOpen]}>
      <View style={[styles.box, focused && styles.boxFocused]}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          onFocus={() => setFocused(true)}
          // Pequeno atraso para o clique no resultado acontecer antes de fechar o menu.
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          style={styles.input}
          accessibilityLabel="Buscar"
        />
      </View>
      {open && (
        <View style={styles.menu}>
          {results.length === 0 ? (
            <Text style={styles.empty}>Nada encontrado para “{q.trim()}”.</Text>
          ) : (
            results.map((r) => (
              <Pressable
                key={r.label + r.kind}
                onPress={() => {
                  setQ('');
                  router.push(r.href as never);
                }}
                style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [styles.item, hovered && styles.itemHover]}
              >
                <Ionicons name="search" size={14} color={colors.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemLabel} numberOfLines={1}>
                    {r.label}
                  </Text>
                  <Text style={styles.itemKind}>{r.kind}</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', zIndex: 1 },
  wrapOpen: { zIndex: 50 },
  box: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.paper,
    justifyContent: 'center',
  },
  boxFocused: { borderColor: colors.gold, boxShadow: shadows.focus },
  input: { fontFamily: fonts.regular, fontSize: 14, color: colors.navy, outlineStyle: 'none' } as object,
  menu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingVertical: 6,
    boxShadow: shadows.popover,
  },
  empty: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, padding: 14 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 9 },
  itemHover: { backgroundColor: colors.sand },
  itemLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy },
  itemKind: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
