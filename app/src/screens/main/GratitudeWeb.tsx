import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AiResponseCard } from '../../components/AiResponseCard';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { Card, Chip, Divider, Eyebrow, PageHeader } from '../../components/ui';
import { MOODS } from '../../content/traditions';
import { longDateCapitalized, weekdayShortDate } from '../../lib/format';
import { useAiDiario, useCreateJournalEntry, useJournal } from '../../lib/queries';
import { colors, fonts, type } from '../../theme';

const PLACEHOLDERS = ['Um momento bom de hoje…', 'Algo pequeno que fez diferença…', 'Alguém que você quer lembrar…'];

// W12 · Diário — Gratidão
export function GratitudeWeb() {
  const toast = useToast();
  const recent = useJournal({ limit: 4 });
  const create = useCreateJournalEntry();
  const { width } = useWindowDimensions();
  const wide = width >= 1100;

  const [items, setItems] = useState(['', '', '']);
  const [mood, setMood] = useState<string | null>(null);
  // Último registro salvo: base para a reflexão com IA.
  const [lastSaved, setLastSaved] = useState<{ items: string[]; mood: string | null } | null>(null);
  const aiReflection = useAiDiario();
  const reflect = () => lastSaved && aiReflection.mutate(lastSaved);

  function save() {
    if (!items.some((i) => i.trim())) return toast('Escreva pelo menos um motivo de gratidão.');
    create.mutate(
      { items, mood },
      {
        onSuccess: () => {
          setLastSaved({ items: items.filter((i) => i.trim()), mood });
          aiReflection.reset();
          setItems(['', '', '']);
          setMood(null);
          toast('Registro salvo no seu diário.');
        },
        onError: (e) => toast(e.message),
      }
    );
  }

  return (
    <View style={{ gap: 24 }}>
      <PageHeader eyebrow="Diário" title="Gratidão" right={<Text style={styles.date}>{longDateCapitalized()}</Text>} />

      <View style={[styles.row, !wide && styles.column]}>
        <Card style={[styles.form, wide ? { flex: 1.5 } : styles.formNarrow]}>
          <View style={{ gap: 12 }}>
            <Eyebrow>Pergunta de hoje</Eyebrow>
            <Text style={styles.question}>Pelo que você agradece hoje?</Text>
          </View>

          <View style={{ marginTop: 18 }}>
            {items.map((value, i) => (
              <View key={i} style={styles.line}>
                <Text style={styles.number}>{i + 1}</Text>
                <TextInput
                  value={value}
                  onChangeText={(v) => setItems((all) => all.map((x, j) => (j === i ? v : x)))}
                  placeholder={PLACEHOLDERS[i]}
                  placeholderTextColor={colors.placeholder}
                  style={styles.input}
                  accessibilityLabel={`Motivo de gratidão ${i + 1}`}
                />
              </View>
            ))}
          </View>

          <Text style={styles.moodLabel}>Como você se sente?</Text>
          <View style={styles.moods}>
            {MOODS.map((m) => (
              <Chip key={m} label={m} active={mood === m} onPress={() => setMood(mood === m ? null : m)} />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.private}>Privado · só você vê seus registros</Text>
            <Button title="Salvar registro" loading={create.isPending} onPress={save} />
          </View>

          {lastSaved &&
            (aiReflection.isIdle ? (
              <Button
                title="Receber uma reflexão sobre o registro"
                variant="outline"
                size="sm"
                style={{ alignSelf: 'flex-start', marginTop: 20 }}
                icon={<Ionicons name="sparkles" size={14} color={colors.navy} />}
                onPress={reflect}
              />
            ) : (
              <AiResponseCard
                label="Reflexão com IA"
                loading={aiReflection.isPending}
                error={aiReflection.error}
                data={aiReflection.data}
                onRegenerate={reflect}
                saveAs={{ type: 'reflexao', subtitle: 'Reflexão com IA · Diário de gratidão' }}
                style={{ marginTop: 20 }}
              />
            ))}
        </Card>

        <Card style={[styles.recent, !wide && { width: '100%' }]}>
          <Eyebrow>Últimos registros</Eyebrow>
          <View style={{ marginTop: 10 }}>
            {recent.isLoading ? (
              <Text style={styles.meta}>Carregando…</Text>
            ) : (recent.data ?? []).length === 0 ? (
              <Text style={[styles.meta, { paddingVertical: 12 }]}>Seus registros vão aparecer aqui.</Text>
            ) : (
              recent.data!.map((e) => (
                <View key={e.id}>
                  <View style={styles.entry}>
                    <View style={styles.entryHead}>
                      <Text style={styles.meta}>{weekdayShortDate(e.entry_date)}</Text>
                      {e.mood ? <Text style={styles.meta}>{e.mood}</Text> : null}
                    </View>
                    <Text style={styles.entryText}>{e.items.join(' · ')}</Text>
                  </View>
                  <Divider />
                </View>
              ))
            )}
          </View>
          <Link href="/diario/historico" style={styles.link}>
            Ver histórico →
          </Link>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  date: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  row: { flexDirection: 'row', gap: 20, alignItems: 'stretch' },
  column: { flexDirection: 'column' },
  form: { padding: 36, minHeight: 600 },
  formNarrow: { padding: 22, minHeight: 0 },
  question: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 36, color: colors.title },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  number: { fontFamily: fonts.serif, fontSize: 18, color: colors.gold, width: 14 },
  input: {
    flex: 1,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.navy,
    outlineStyle: 'none',
  } as object,
  moodLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy, marginTop: 26 },
  moods: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 28,
    gap: 12,
  },
  private: { ...type.meta, fontSize: 13, color: colors.text },
  recent: { width: 376, paddingTop: 26 },
  entry: { paddingVertical: 14, gap: 6 },
  entryHead: { flexDirection: 'row', justifyContent: 'space-between' },
  entryText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.navy },
  meta: { ...type.meta, color: colors.text },
  link: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy, marginTop: 14 },
});
