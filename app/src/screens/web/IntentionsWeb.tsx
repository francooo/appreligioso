import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { Card, Chip, PageHeader } from '../../components/ui';
import { INTENTION_TAGS } from '../../content/traditions';
import { Intention } from '../../lib/api';
import { relativeAge } from '../../lib/format';
import { useIntentionMutations, useIntentions, useTradition } from '../../lib/queries';
import { colors, fonts, radii, type } from '../../theme';

type Tab = 'active' | 'answered';

// W10 · Orar — Intenções (o nome muda por tradição: Pedidos de oração, Vibrações, Súplicas...)
export function IntentionsWeb() {
  const rel = useTradition();
  const toast = useToast();
  const all = useIntentions();
  const { create } = useIntentionMutations();

  const [text, setText] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('active');

  const active = (all.data ?? []).filter((i) => i.status === 'active');
  const answered = (all.data ?? []).filter((i) => i.status === 'answered');
  const list = tab === 'active' ? active : answered;

  function add() {
    if (!text.trim()) return toast('Escreva por quem ou pelo que você quer orar.');
    create.mutate(
      { text, tag },
      {
        onSuccess: () => {
          setText('');
          setTag(null);
          setTab('active');
          toast('Adicionada.');
        },
        onError: (e) => toast(e.message),
      }
    );
  }

  return (
    <View style={{ gap: 24 }}>
      <PageHeader eyebrow="Orar" title={rel.intentName} />

      <Card style={{ gap: 18 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          placeholder="Escreva por quem ou pelo que você quer orar…"
          placeholderTextColor={colors.placeholder}
          style={styles.composer}
          accessibilityLabel="Nova intenção"
        />
        <View style={styles.composerFoot}>
          <View style={styles.tags}>
            {INTENTION_TAGS.map((t) => (
              <Chip key={t} label={t} tone={tag === t ? 'tag' : 'default'} onPress={() => setTag(tag === t ? null : t)} />
            ))}
          </View>
          <Button title="Adicionar" loading={create.isPending} onPress={add} />
        </View>
      </Card>

      <View style={styles.tabs}>
        <TabButton label={`Ativas (${active.length})`} active={tab === 'active'} onPress={() => setTab('active')} />
        <TabButton label={`Atendidas (${answered.length})`} active={tab === 'answered'} onPress={() => setTab('answered')} />
      </View>

      <View style={{ gap: 12 }}>
        {all.isLoading ? (
          <Text style={styles.meta}>Carregando…</Text>
        ) : list.length === 0 ? (
          <Text style={styles.meta}>
            {tab === 'active'
              ? 'Nenhuma intenção ativa. Escreva acima a primeira.'
              : 'Quando uma intenção for atendida, marque-a e ela aparece aqui.'}
          </Text>
        ) : (
          list.map((i) => <IntentionRow key={i.id} intention={i} />)
        )}
      </View>
    </View>
  );
}

function IntentionRow({ intention: i }: { intention: Intention }) {
  const toast = useToast();
  const { update, remove } = useIntentionMutations();
  const [praying, setPraying] = useState(false);
  const answered = i.status === 'answered';

  const meta = answered
    ? relativeAge(i.answered_at ?? i.created_at, 'Atendida')
    : `${relativeAge(i.created_at)}${i.tag ? ` · ${i.tag}` : ''}`;

  return (
    <Card padded={false} style={styles.item}>
      <View style={styles.itemRow}>
        <View style={[styles.dot, answered && { backgroundColor: colors.success }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemText, answered && styles.itemAnswered]}>{i.text}</Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>
        {answered ? (
          <View style={styles.actions}>
            <Button
              title="Reabrir"
              size="sm"
              variant="tertiary"
              onPress={() => update.mutate({ id: i.id, status: 'active' }, { onError: (e) => toast(e.message) })}
            />
            <Button
              title="Excluir"
              size="sm"
              variant="tertiary"
              onPress={() =>
                remove.mutate(i.id, { onSuccess: () => toast('Excluída.'), onError: (e) => toast(e.message) })
              }
            />
          </View>
        ) : (
          <View style={styles.actions}>
            <Button title={praying ? 'Concluir' : 'Orar agora'} size="sm" onPress={() => setPraying((p) => !p)} />
            <Button
              title="Marcar como atendida"
              size="sm"
              variant="tertiary"
              onPress={() =>
                update.mutate(
                  { id: i.id, status: 'answered' },
                  { onSuccess: () => toast('Que bom! Movida para Atendidas.'), onError: (e) => toast(e.message) }
                )
              }
            />
          </View>
        )}
      </View>
      {praying && (
        <View style={styles.prayer}>
          <Text style={styles.prayerText}>
            Respire fundo e reserve um instante de silêncio. Entregue “{i.text}” com calma, do seu jeito. Quando sentir
            que foi atendida, é só marcar.
          </Text>
        </View>
      )}
    </Card>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  composer: {
    height: 54,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radii.field,
    backgroundColor: colors.white,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.navy,
    outlineStyle: 'none',
  } as object,
  composerFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  tags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tabs: { flexDirection: 'row', gap: 28, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  tab: { paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: colors.navy },
  tabText: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  tabTextActive: { fontFamily: fonts.medium, color: colors.navy },
  item: { paddingHorizontal: 22, paddingVertical: 18 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold },
  itemText: { fontFamily: fonts.medium, fontSize: 17, color: colors.navy },
  itemAnswered: { color: colors.text },
  meta: { ...type.meta, fontSize: 13, color: colors.text, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 10 },
  prayer: { marginTop: 14, marginLeft: 23, padding: 16, borderRadius: 12, backgroundColor: colors.sand },
  prayerText: { fontFamily: fonts.serifMedium, fontSize: 16, lineHeight: 24, color: colors.title },
});
