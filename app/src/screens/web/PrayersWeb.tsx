import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { Card, Divider, Eyebrow, HighlightCard, PageHeader } from '../../components/ui';
import { currentPrayer } from '../../lib/format';
import {
  useReminderMutations,
  useReminders,
  useSaved,
  useToggleSaved,
  useTradition,
  useTraditionKey,
} from '../../lib/queries';
import { colors, fonts, radii, type } from '../../theme';

const PERIODS = ['Manhã', 'Tarde', 'Noite'];

// W9 · Orar — Orações
export function PrayersWeb() {
  const rel = useTradition();
  const trad = useTraditionKey();
  const toast = useToast();
  const now = currentPrayer(rel);
  const reminders = useReminders();
  const { create } = useReminderMutations();
  const saved = useSaved('oracao');
  const toggleSaved = useToggleSaved();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;

  const [reading, setReading] = useState<string | null>(null);

  const reminderFor = (time: string, label: string) =>
    reminders.data?.find((r) => r.enabled && r.time === time && r.label === label);

  const day = rel.prayers.map((name, i) => ({ name, time: rel.times[i], period: PERIODS[i] ?? '', now: i === now.index }));
  const savedKey = (name: string) => `${trad}:oracao:${name}`;
  const savedItem = reading ? saved.data?.find((s) => s.key === savedKey(reading)) : undefined;

  return (
    <View style={{ gap: 24 }}>
      <PageHeader eyebrow="Orar" title="Orações" />

      <HighlightCard style={styles.hero}>
        <View style={{ flex: 1, gap: 8 }}>
          <Eyebrow style={{ color: colors.goldLight }}>{`Agora · ${now.period}`}</Eyebrow>
          <Text style={styles.heroTitle}>{now.name}</Text>
          <Text style={styles.heroSub}>{rel.sub}</Text>
        </View>
        <View style={styles.heroActions}>
          <Pressable style={styles.ghost} onPress={() => setReading(now.name)} accessibilityRole="button">
            <Text style={styles.ghostText}>Ler o texto</Text>
          </Pressable>
          <Pressable
            style={styles.play}
            onPress={() => toast('O áudio guiado chega em breve.')}
            accessibilityRole="button"
            accessibilityLabel="Ouvir"
          >
            <Ionicons name="play" size={22} color={colors.navy} style={{ marginLeft: 3 }} />
          </Pressable>
        </View>
      </HighlightCard>

      {reading && (
        <Card style={styles.reading}>
          <View style={{ flex: 1, gap: 6 }}>
            <Eyebrow>Oração</Eyebrow>
            <Text style={styles.readingTitle}>{reading}</Text>
            <Text style={styles.meta}>O texto completo desta oração chega em breve ao Lumina.</Text>
            <Button
              title={savedItem ? 'Salva' : 'Salvar oração'}
              size="sm"
              variant="tertiary"
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
              loading={toggleSaved.isPending}
              icon={savedItem ? <Ionicons name="bookmark" size={13} color={colors.gold} /> : undefined}
              onPress={() =>
                toggleSaved.mutate(
                  { savedId: savedItem?.id, type: 'oracao', key: savedKey(reading), title: reading, subtitle: 'Texto e áudio' },
                  {
                    onSuccess: () => toast(savedItem ? 'Removida dos salvos.' : 'Salva em Perfil · Salvos.'),
                    onError: (e) => toast(e.message),
                  }
                )
              }
            />
          </View>
          <Pressable onPress={() => setReading(null)} accessibilityLabel="Fechar" hitSlop={8}>
            <Ionicons name="close" size={20} color={colors.muted} />
          </Pressable>
        </Card>
      )}

      <View style={[styles.row, !wide && styles.column]}>
        <Card style={styles.col}>
          <Eyebrow>Orações do dia</Eyebrow>
          <View style={{ marginTop: 8 }}>
            {day.map((p) => {
              const active = reminderFor(p.time, p.name);
              return (
                <View key={p.name}>
                  <View style={styles.dayRow}>
                    <Text style={styles.time}>{p.time}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{p.name}</Text>
                      <Text style={styles.period}>{p.period}</Text>
                    </View>
                    {p.now ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Agora</Text>
                      </View>
                    ) : active ? (
                      <Text style={styles.meta}>Lembrete ativo</Text>
                    ) : (
                      <Pressable
                        hitSlop={6}
                        onPress={() =>
                          create.mutate(
                            { time: p.time, label: p.name },
                            { onSuccess: () => toast(`Lembrete das ${p.time} criado.`), onError: (e) => toast(e.message) }
                          )
                        }
                      >
                        <Text style={styles.link}>Lembrar</Text>
                      </Pressable>
                    )}
                  </View>
                  <Divider />
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={styles.col}>
          <Eyebrow>Acervo</Eyebrow>
          <View style={{ marginTop: 4 }}>
            {rel.library.map((item) => (
              <View key={item}>
                <View style={styles.libRow}>
                  <Text style={styles.libName}>{item}</Text>
                  <View style={styles.libActions}>
                    <Pressable onPress={() => toast('O áudio chega em breve.')} hitSlop={6}>
                      <Text style={styles.libLink}>Ouvir</Text>
                    </Pressable>
                    <Pressable onPress={() => setReading(item)} hitSlop={6}>
                      <Text style={styles.libLink}>Ler</Text>
                    </Pressable>
                  </View>
                </View>
                <Divider />
              </View>
            ))}
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingHorizontal: 34, paddingVertical: 32 },
  heroTitle: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 38, color: colors.white },
  heroSub: { fontFamily: fonts.regular, fontSize: 15, color: colors.navyTextLight },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ghost: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
  },
  ghostText: { fontFamily: fonts.medium, fontSize: 14, color: colors.white },
  play: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  reading: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', borderColor: colors.goldLight },
  readingTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.title },
  row: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  col: { flex: 1, paddingTop: 26 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: 18 },
  time: { fontFamily: fonts.serif, fontSize: 19, color: colors.title, width: 60 },
  name: { fontFamily: fonts.regular, fontSize: 16, color: colors.navy },
  period: { ...type.meta, color: colors.muted, marginTop: 2 },
  badge: { backgroundColor: colors.peach, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.tagText },
  meta: { ...type.meta, fontSize: 13, color: colors.text },
  link: { fontFamily: fonts.medium, fontSize: 13, color: colors.navy },
  libRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  libName: { fontFamily: fonts.regular, fontSize: 16, color: colors.navy },
  libActions: { flexDirection: 'row', gap: 18 },
  libLink: { fontFamily: fonts.medium, fontSize: 13, color: colors.navy },
});
