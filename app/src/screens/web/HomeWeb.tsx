import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Dunes } from '../../components/Dunes';
import { SearchBox } from '../../components/SearchBox';
import { TraditionSelect } from '../../components/TraditionSelect';
import { useToast } from '../../components/Toast';
import { Card, Eyebrow, HighlightCard, ProgressBar } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_TRADITION } from '../../content/traditions';
import { currentPrayer, greeting, longDate, nextPrayer, toMinutes } from '../../lib/format';
import {
  useCreateJournalEntry,
  useIntentionMutations,
  useIntentions,
  useProgress,
  useReminders,
  useSaved,
  useToggleSaved,
  useTradition,
  useUpdateProfile,
} from '../../lib/queries';
import { colors, fonts, radii, type } from '../../theme';

// W5 · Home
export function HomeWeb() {
  const { user } = useAuth();
  const rel = useTradition();
  const toast = useToast();
  const updateProfile = useUpdateProfile();
  const { width } = useWindowDimensions();
  const wide = width >= 1180;

  const firstName = user?.name?.split(' ')[0];

  return (
    <View style={styles.page}>
      <View style={[styles.header, !wide && styles.headerStack]}>
        <View style={{ gap: 6 }}>
          <Eyebrow>{longDate()}</Eyebrow>
          <Text style={styles.title}>
            {greeting()}
            {firstName ? `, ${firstName}` : ''}.
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TraditionSelect
            value={user?.tradition ?? DEFAULT_TRADITION}
            onChange={(tradition) =>
              updateProfile.mutate(
                { tradition },
                { onError: (e) => toast(e.message), onSuccess: () => toast('Tradição atualizada.') }
              )
            }
          />
          <SearchBox />
        </View>
      </View>

      <View style={[styles.row, !wide && styles.column]}>
        <WordOfDayCard style={wide ? { flex: 1.6 } : undefined} />
        <HighlightCard style={[styles.moment, wide && { flex: 1 }]}>
          <View style={{ gap: 10 }}>
            <Eyebrow style={{ color: colors.goldLight }}>Momento de oração</Eyebrow>
            <Text style={styles.momentTitle}>{currentPrayer(rel).name}</Text>
            <Text style={styles.momentSub}>{rel.sub}</Text>
          </View>
          <Pressable style={styles.audioRow} onPress={() => toast('O áudio guiado chega em breve.')}>
            <View style={styles.play}>
              <Ionicons name="play" size={18} color={colors.navy} style={{ marginLeft: 2 }} />
            </View>
            <Text style={styles.audioText}>Áudio guiado · 6 min</Text>
          </Pressable>
        </HighlightCard>
      </View>

      <View style={[styles.row, !wide && styles.column]}>
        <ContinueReadingCard />
        <GratitudeCard />
        <IntentionsCard />
      </View>
    </View>
  );
}

function WordOfDayCard({ style }: { style?: object }) {
  const rel = useTradition();
  const { user } = useAuth();
  const toast = useToast();
  const saved = useSaved('passagem');
  const toggle = useToggleSaved();
  const key = `${user?.tradition ?? DEFAULT_TRADITION}:palavra-do-dia`;
  const savedItem = saved.data?.find((s) => s.key === key);

  return (
    <Card padded={false} style={[styles.wordCard, style]}>
      <Dunes height="58%" />
      <View style={styles.wordBody}>
        <Eyebrow>Palavra do dia</Eyebrow>
        <Text style={styles.verse}>{rel.verse}</Text>
        <Text style={styles.ref}>{rel.ref}</Text>
      </View>
      <View style={styles.wordActions}>
        <Button title="Ler reflexão" size="sm" onPress={() => router.push('/leituras/palavra' as never)} />
        <Button title="Ouvir · 3 min" size="sm" variant="tertiary" onPress={() => toast('O áudio chega em breve.')} />
        <Button
          title={savedItem ? 'Salvo' : 'Salvar'}
          size="sm"
          variant="tertiary"
          loading={toggle.isPending}
          icon={savedItem ? <Ionicons name="bookmark" size={13} color={colors.gold} /> : undefined}
          onPress={() =>
            toggle.mutate(
              { savedId: savedItem?.id, type: 'passagem', key, title: rel.verse, subtitle: rel.ref },
              {
                onSuccess: () => toast(savedItem ? 'Removido dos salvos.' : 'Salvo em Perfil · Salvos.'),
                onError: (e) => toast(e.message),
              }
            )
          }
        />
      </View>
    </Card>
  );
}

function ContinueReadingCard() {
  const rel = useTradition();
  const progress = useProgress();
  const current = progress.data?.[0];
  const pct = current ? Math.round((current.step / current.total) * 100) : 0;

  return (
    <Card style={styles.smallCard}>
      <Eyebrow>Continue sua leitura</Eyebrow>
      <Text style={styles.cardTitle}>{current?.plan_title ?? rel.plan}</Text>
      <Text style={styles.meta}>{current ? `Dia ${current.step} de ${current.total}` : 'Ainda não iniciado'}</Text>
      <ProgressBar value={pct} style={{ marginTop: 18 }} />
      <Link href={'/leituras/planos' as never} style={styles.link}>
        {current ? 'Continuar leitura →' : 'Começar leitura →'}
      </Link>
    </Card>
  );
}

function GratitudeCard() {
  const [text, setText] = useState('');
  const create = useCreateJournalEntry();
  const toast = useToast();

  return (
    <Card style={styles.smallCard}>
      <Eyebrow>Diário de gratidão</Eyebrow>
      <Text style={styles.cardTitle}>Pelo que você agradece hoje?</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Escreva algumas palavras…"
        placeholderTextColor={colors.placeholder}
        multiline
        style={styles.textarea}
      />
      {text.trim() ? (
        <Button
          title="Salvar no diário"
          size="sm"
          loading={create.isPending}
          style={{ alignSelf: 'flex-start', marginTop: 12 }}
          onPress={() =>
            create.mutate(
              { items: [text] },
              {
                onSuccess: () => {
                  setText('');
                  toast('Registro salvo no seu diário.');
                },
                onError: (e) => toast(e.message),
              }
            )
          }
        />
      ) : null}
    </Card>
  );
}

function IntentionsCard() {
  const rel = useTradition();
  const toast = useToast();
  const intentions = useIntentions('active');
  const reminders = useReminders();
  const { create } = useIntentionMutations();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const next = useMemo(() => {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const enabled = (reminders.data ?? []).filter((r) => r.enabled);
    if (enabled.length) {
      const r = enabled.find((x) => toMinutes(x.time) > mins) ?? enabled[0];
      return `${r.time} · ${r.label}`;
    }
    const p = nextPrayer(rel, now);
    return `${p.time} · ${p.name}`;
  }, [reminders.data, rel]);

  function submit() {
    if (!draft.trim()) return setAdding(false);
    create.mutate(
      { text: draft },
      {
        onSuccess: () => {
          setDraft('');
          setAdding(false);
        },
        onError: (e) => toast(e.message),
      }
    );
  }

  const list = intentions.data ?? [];

  return (
    <Card style={styles.smallCard}>
      <View style={styles.cardHead}>
        <Eyebrow>{`Suas ${rel.intentName}`}</Eyebrow>
        <Pressable onPress={() => setAdding((a) => !a)} hitSlop={8}>
          <Text style={styles.newLink}>{adding ? 'Cancelar' : '+ Nova'}</Text>
        </Pressable>
      </View>

      {adding && (
        <TextInput
          autoFocus
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          placeholder="Por quem ou pelo que você quer orar?"
          placeholderTextColor={colors.placeholder}
          style={styles.inlineInput}
        />
      )}

      <View style={{ gap: 10, marginTop: 14 }}>
        {list.slice(0, 3).map((i) => (
          <View key={i.id} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText} numberOfLines={1}>
              {i.text}
            </Text>
          </View>
        ))}
        {!intentions.isLoading && list.length === 0 && !adding && (
          <Text style={styles.meta}>Nenhuma ainda. Toque em “+ Nova” para começar.</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Próximo lembrete: {next}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  page: { gap: 24 },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, zIndex: 10 },
  headerStack: { flexDirection: 'column', alignItems: 'flex-start' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  title: { ...type.title, color: colors.title },
  row: { flexDirection: 'row', gap: 20 },
  column: { flexDirection: 'column' },

  wordCard: { minHeight: 316, overflow: 'hidden', justifyContent: 'space-between' },
  wordBody: { padding: 36, paddingBottom: 0, gap: 12 },
  verse: { ...type.quote, fontSize: 28, lineHeight: 36, color: colors.title, maxWidth: 520 },
  ref: { ...type.meta, fontSize: 14, color: colors.text },
  wordActions: { flexDirection: 'row', gap: 10, padding: 36, paddingTop: 24 },

  moment: { minHeight: 316, padding: 30, justifyContent: 'space-between' },
  momentTitle: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, color: colors.white },
  momentSub: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.navyTextLight },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 24 },
  play: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioText: { fontFamily: fonts.regular, fontSize: 15, color: colors.navyTextLight },

  smallCard: { flex: 1, minHeight: 222 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...type.cardTitle, color: colors.title, marginTop: 12 },
  meta: { ...type.meta, fontSize: 13, color: colors.text, marginTop: 8 },
  link: { fontFamily: fonts.medium, fontSize: 15, color: colors.navy, marginTop: 20 },
  textarea: {
    marginTop: 14,
    minHeight: 82,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inputBorder,
    borderRadius: radii.field,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.navy,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as object,
  newLink: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy },
  inlineInput: {
    marginTop: 12,
    height: 40,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radii.field,
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.navy,
    outlineStyle: 'none',
  } as object,
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold },
  bulletText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.body },
  footer: { marginTop: 'auto', paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.divider },
  footerText: { ...type.meta, color: colors.text },
});
