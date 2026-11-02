import { ComponentRef, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Dunes } from '../../components/Dunes';
import { useToast } from '../../components/Toast';
import { Card, Eyebrow, HighlightCard, PageHeader } from '../../components/ui';
import { longDateCapitalized } from '../../lib/format';
import { useCreateJournalEntry, useSaved, useToggleSaved, useTradition, useTraditionKey } from '../../lib/queries';
import { colors, fonts, radii, type } from '../../theme';

// Texto de reflexão e pergunta do mockup: servem para qualquer passagem.
const REFLECTION =
  'Leia a passagem devagar, duas vezes. Perceba qual palavra chama mais a sua atenção e fique com ela por alguns instantes. Pergunte-se o que ela pede de você hoje: uma atitude, um perdão, uma pausa. Não é preciso ter todas as respostas; basta começar com um pequeno gesto.';
const TAKEAWAY = 'O que você pode entregar hoje, em vez de carregar sozinha(o)?';

// W6 · Leituras — Palavra diária
export function WordWeb() {
  const rel = useTradition();
  const trad = useTraditionKey();
  const toast = useToast();
  const { width } = useWindowDimensions();
  const wide = width >= 1180;

  const [date, setDate] = useState(() => new Date());
  const isToday = date.toDateString() === new Date().toDateString();
  const shiftDay = (days: number) => setDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));

  const saved = useSaved('passagem');
  const toggleSaved = useToggleSaved();
  const savedKey = `${trad}:palavra-do-dia`;
  const savedItem = saved.data?.find((s) => s.key === savedKey);

  const [note, setNote] = useState('');
  const noteRef = useRef<ComponentRef<typeof TextInput>>(null);
  const createEntry = useCreateJournalEntry();

  async function share() {
    const text = `${rel.verse}\n${rel.ref}\n\n— Lumina`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast('Passagem copiada para compartilhar.');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') toast('Não foi possível compartilhar agora.');
    }
  }

  return (
    <View style={{ gap: 24 }}>
      <PageHeader
        eyebrow="Leituras"
        title="Palavra diária"
        right={
          <View style={styles.dateNav}>
            <RoundButton icon="chevron-back" label="Dia anterior" onPress={() => shiftDay(-1)} />
            <Text style={styles.dateText}>{longDateCapitalized(date)}</Text>
            <RoundButton icon="chevron-forward" label="Próximo dia" onPress={() => shiftDay(1)} disabled={isToday} />
          </View>
        }
      />

      <View style={[styles.row, !wide && styles.column]}>
        <Card padded={false} style={[styles.wordCard, wide && { flex: 1.5 }]}>
          <Dunes height="34%" />
          <View style={styles.wordBody}>
            <Eyebrow>Palavra do dia</Eyebrow>
            <Text style={styles.verse}>{rel.verse}</Text>
            <Text style={styles.ref}>{rel.ref}</Text>
            <View style={styles.goldRule} />
            <Text style={styles.reflectionTitle}>Reflexão</Text>
            <Text style={styles.reflection}>{REFLECTION}</Text>
          </View>
        </Card>

        <View style={[styles.side, !wide && { width: '100%' }]}>
          <HighlightCard style={styles.audio}>
            <Eyebrow style={{ color: colors.goldLight }}>Ouvir reflexão</Eyebrow>
            <Pressable style={styles.audioRow} onPress={() => toast('O áudio da reflexão chega em breve.')}>
              <View style={styles.play}>
                <Ionicons name="play" size={18} color={colors.navy} style={{ marginLeft: 2 }} />
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <View style={styles.audioTrack} />
                <Text style={styles.audioTime}>Áudio em breve</Text>
              </View>
            </Pressable>
          </HighlightCard>

          <Card style={styles.takeaway}>
            <Eyebrow>Para levar no dia</Eyebrow>
            <Text style={styles.takeawayTitle}>{TAKEAWAY}</Text>
            <TextInput
              ref={noteRef}
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="Escreva aqui, se quiser…"
              placeholderTextColor={colors.placeholder}
              style={styles.textarea}
            />
            <Button
              title="Escrever no diário"
              loading={createEntry.isPending}
              onPress={() =>
                !note.trim()
                  ? noteRef.current?.focus()
                  : createEntry.mutate(
                  { items: [note] },
                  {
                    onSuccess: () => {
                      setNote('');
                      toast('Registro salvo no seu diário.');
                    },
                    onError: (e) => toast(e.message),
                  }
                )
              }
            />
          </Card>

          <View style={styles.actions}>
            <Button
              title={savedItem ? 'Salvo' : 'Salvar'}
              variant="tertiary"
              style={{ flex: 1 }}
              loading={toggleSaved.isPending}
              icon={savedItem ? <Ionicons name="bookmark" size={14} color={colors.gold} /> : undefined}
              onPress={() =>
                toggleSaved.mutate(
                  { savedId: savedItem?.id, type: 'passagem', key: savedKey, title: rel.verse, subtitle: rel.ref },
                  {
                    onSuccess: () => toast(savedItem ? 'Removido dos salvos.' : 'Salvo em Perfil · Salvos.'),
                    onError: (e) => toast(e.message),
                  }
                )
              }
            />
            <Button title="Compartilhar" variant="tertiary" style={{ flex: 1 }} onPress={share} />
          </View>
        </View>
      </View>
    </View>
  );
}

function RoundButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: 'chevron-back' | 'chevron-forward';
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.round, disabled && { opacity: 0.4 }]}
    >
      <Ionicons name={icon} size={16} color={colors.navy} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dateNav: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dateText: { fontFamily: fonts.regular, fontSize: 15, color: colors.navy, minWidth: 190, textAlign: 'center' },
  round: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: 20, alignItems: 'stretch' },
  column: { flexDirection: 'column' },
  wordCard: { minHeight: 600, overflow: 'hidden' },
  wordBody: { padding: 44, gap: 14, maxWidth: 560 },
  verse: { fontFamily: fonts.serifMedium, fontSize: 34, lineHeight: 44, color: colors.title },
  ref: { ...type.meta, fontSize: 15, color: colors.text },
  goldRule: { width: 48, height: 2, backgroundColor: colors.gold, marginVertical: 14 },
  reflectionTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.title },
  reflection: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 26, color: colors.body },

  side: { width: 376, gap: 20 },
  audio: { paddingVertical: 24, gap: 18 },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  play: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  audioTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
  audioTime: { fontFamily: fonts.regular, fontSize: 12, color: colors.navyTextLight },
  takeaway: { flex: 1, gap: 14 },
  takeawayTitle: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 27, color: colors.title },
  textarea: {
    flex: 1,
    minHeight: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inputBorder,
    borderRadius: radii.field,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.navy,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as object,
  actions: { flexDirection: 'row', gap: 12 },
});
