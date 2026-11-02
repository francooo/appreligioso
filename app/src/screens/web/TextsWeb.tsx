import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Dunes } from '../../components/Dunes';
import { useToast } from '../../components/Toast';
import { Card, Divider, Eyebrow, PageHeader } from '../../components/ui';
import { TEXTS_PREFIX } from '../../content/plans';
import { dayAndTime } from '../../lib/format';
import { useLastText, useSaveProgress, useTradition, useTraditionKey } from '../../lib/queries';
import { colors, fonts, radii, type } from '../../theme';

// W8 · Leituras — Textos sagrados (índice da tradição: Bíblia, Torá, Alcorão, Cânone Pāli...)
export function TextsWeb() {
  const rel = useTradition();
  const trad = useTraditionKey();
  const toast = useToast();
  const last = useLastText();
  const save = useSaveProgress();
  const { width } = useWindowDimensions();
  const twoColumns = width >= 900;

  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState<string | null>(null);

  const term = normalize(query);
  const sections = rel.sections.filter((s) => normalize(s).includes(term));
  const title = rel.book === 'Bíblia' ? 'Bíblia Sagrada' : rel.book;

  function open(section: string) {
    setOpened(section);
    save.mutate({ plan_key: `${TEXTS_PREFIX}${trad}`, plan_title: section, step: 0, total: 1 });
  }

  // Duas colunas como no mockup, preenchidas linha a linha (Gênesis | Êxodo, Salmos | Provérbios...).
  const rows: string[][] = [];
  const perRow = twoColumns ? 2 : 1;
  for (let i = 0; i < sections.length; i += perRow) rows.push(sections.slice(i, i + perRow));

  return (
    <View style={{ gap: 24 }}>
      <PageHeader
        eyebrow="Leituras · Textos sagrados"
        title={title}
        right={
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar livro, capítulo ou trecho…"
            placeholderTextColor={colors.placeholder}
            style={styles.search}
            accessibilityLabel="Buscar nos textos"
          />
        }
      />

      <Card padded={false} style={styles.resume}>
        <Dunes height="72%" />
        <View style={styles.resumeBody}>
          <View style={{ gap: 6, flexShrink: 1 }}>
            <Eyebrow>{last.data ? 'Continuar de onde parou' : 'Passagem do dia'}</Eyebrow>
            <Text style={styles.resumeTitle}>{last.data?.plan_title ?? rel.ref}</Text>
            <Text style={styles.meta}>
              {last.data ? `Última leitura ${dayAndTime(last.data.updated_at)}` : rel.verse}
            </Text>
          </View>
          <View style={styles.resumeActions}>
            <Button title="Ouvir" variant="tertiary" size="sm" style={styles.smallPill} onPress={() => toast('O áudio chega em breve.')} />
            <Button
              title="Abrir leitura"
              size="sm"
              style={styles.smallPill}
              onPress={() => (last.data ? setOpened(last.data.plan_title) : router.push('/leituras/palavra' as never))}
            />
          </View>
        </View>
      </Card>

      {opened && (
        <Card style={styles.opened}>
          <View style={{ flex: 1, gap: 6 }}>
            <Eyebrow>{rel.book}</Eyebrow>
            <Text style={styles.openedTitle}>{opened}</Text>
            <Text style={styles.meta}>
              O texto completo deste livro ainda não está disponível no Lumina. Guardamos este ponto para você continuar
              daqui quando ele chegar.
            </Text>
          </View>
          <Pressable onPress={() => setOpened(null)} accessibilityLabel="Fechar" hitSlop={8}>
            <Ionicons name="close" size={20} color={colors.muted} />
          </Pressable>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Índice</Text>

      <Card style={styles.index}>
        {rows.length === 0 ? (
          <Text style={[styles.meta, { padding: 12 }]}>Nada encontrado para “{query.trim()}”.</Text>
        ) : (
          rows.map((row, r) => (
            <View key={r} style={styles.indexRow}>
              {row.map((s) => (
                <View key={s} style={{ flex: 1 }}>
                  <Pressable
                    onPress={() => open(s)}
                    accessibilityRole="button"
                    style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [styles.indexItem, hovered && styles.indexHover]}
                  >
                    <Text style={styles.indexText}>{s}</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.muted} />
                  </Pressable>
                  <Divider />
                </View>
              ))}
              {row.length < perRow && <View style={{ flex: 1 }} />}
            </View>
          ))
        )}
      </Card>
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
  search: {
    width: 358,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.paper,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.navy,
    outlineStyle: 'none',
  } as object,
  resume: { minHeight: 140, overflow: 'hidden' },
  resumeBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
  resumeTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.title },
  resumeActions: { flexDirection: 'row', gap: 10 },
  smallPill: { height: 44, paddingHorizontal: 22 },
  meta: { ...type.meta, fontSize: 14, color: colors.text },
  opened: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', borderColor: colors.goldLight },
  openedTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.title },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 24, color: colors.title },
  index: { paddingVertical: 8, paddingHorizontal: 12 },
  indexRow: { flexDirection: 'row', gap: 24 },
  indexItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  indexHover: { backgroundColor: colors.sand },
  indexText: { fontFamily: fonts.regular, fontSize: 16, color: colors.navy },
});
