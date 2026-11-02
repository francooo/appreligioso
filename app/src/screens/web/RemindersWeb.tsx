import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { Card, Chip, Divider, Eyebrow, PageHeader, Toggle } from '../../components/ui';
import { Reminder } from '../../lib/api';
import {
  usePreferences,
  useReminderMutations,
  useReminders,
  useTradition,
  useUpdatePreferences,
} from '../../lib/queries';
import { colors, fonts, radii, type } from '../../theme';

const DAY_OPTIONS = ['Todos os dias', 'Seg a sex', 'Fins de semana', 'Domingos'];
const SOUNDS = ['Sino suave', 'Tigela tibetana', 'Harpa', 'Silencioso'];

// W11 · Orar — Lembretes
export function RemindersWeb() {
  const rel = useTradition();
  const toast = useToast();
  const reminders = useReminders();
  const { create } = useReminderMutations();
  const prefs = usePreferences();
  const updatePrefs = useUpdatePreferences();
  const { width } = useWindowDimensions();
  const wide = width >= 1100;

  const [adding, setAdding] = useState(false);
  const [editingCity, setEditingCity] = useState(false);
  const [city, setCity] = useState('');

  const list = reminders.data ?? [];

  async function addSuggested() {
    const suggestions = [
      ...rel.prayers.map((label, i) => ({ time: rel.times[i], label })),
      { time: '08:00', label: 'Palavra do dia' },
    ];
    try {
      for (const s of suggestions) await create.mutateAsync(s);
      toast('Lembretes sugeridos adicionados.');
    } catch (e) {
      toast((e as Error).message);
    }
  }

  const setPref = (patch: Parameters<typeof updatePrefs.mutate>[0]) =>
    updatePrefs.mutate(patch, { onError: (e) => toast(e.message) });

  const p = prefs.data;

  return (
    <View style={{ gap: 24 }}>
      <PageHeader
        eyebrow="Orar"
        title="Lembretes"
        right={<Button title="+ Novo lembrete" size="sm" style={styles.newBtn} onPress={() => setAdding(true)} />}
      />

      <View style={[styles.row, !wide && styles.column]}>
        <View style={{ flex: 1, gap: 16 }}>
          {adding && <NewReminder onClose={() => setAdding(false)} />}

          <Card style={styles.list}>
            {reminders.isLoading ? (
              <Text style={[styles.meta, { paddingVertical: 18 }]}>Carregando…</Text>
            ) : list.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nenhum lembrete ainda.</Text>
                <Text style={styles.meta}>
                  Comece com os horários de oração da tradição {rel.name.toLowerCase()} ou crie o seu.
                </Text>
                <Button
                  title="Adicionar lembretes sugeridos"
                  size="sm"
                  loading={create.isPending}
                  style={{ alignSelf: 'flex-start', marginTop: 8 }}
                  onPress={addSuggested}
                />
              </View>
            ) : (
              list.map((r, i) => <ReminderRow key={r.id} reminder={r} last={i === list.length - 1} />)
            )}
          </Card>
          <Text style={styles.note}>Os avisos vão tocar pelo app do Lumina no celular, que chega em breve.</Text>
        </View>

        <Card style={[styles.prefs, !wide && { width: '100%' }]}>
          <Eyebrow>Preferências</Eyebrow>
          <PrefRow
            title="Som do lembrete"
            sub={p?.sound ?? 'Sino suave'}
            onPress={() => {
              const next = SOUNDS[(SOUNDS.indexOf(p?.sound ?? SOUNDS[0]) + 1) % SOUNDS.length];
              setPref({ sound: next });
            }}
            right={<Ionicons name="chevron-forward" size={14} color={colors.muted} />}
          />
          <PrefRow title="Vibração" right={<Toggle label="Vibração" value={!!p?.vibration} onChange={(v) => setPref({ vibration: v })} />} />
          <PrefRow
            title="Não perturbar"
            sub={`${p?.dnd_start ?? '22:00'} às ${p?.dnd_end ?? '06:00'}`}
            right={<Toggle label="Não perturbar" value={!!p?.dnd} onChange={(v) => setPref({ dnd: v })} />}
          />
          <Divider style={{ marginVertical: 6 }} />
          {editingCity ? (
            <View style={{ gap: 10, paddingVertical: 10 }}>
              <Text style={styles.prefTitle}>Localização</Text>
              <TextInput
                autoFocus
                value={city}
                onChangeText={setCity}
                placeholder="Cidade, UF"
                placeholderTextColor={colors.placeholder}
                style={styles.input}
                onSubmitEditing={() => {
                  setPref({ city: city.trim() || null });
                  setEditingCity(false);
                }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button
                  title="Salvar"
                  size="sm"
                  onPress={() => {
                    setPref({ city: city.trim() || null });
                    setEditingCity(false);
                  }}
                />
                <Button title="Cancelar" size="sm" variant="tertiary" onPress={() => setEditingCity(false)} />
              </View>
            </View>
          ) : (
            <PrefRow
              title="Localização"
              sub={`${p?.city ?? 'Não definida'} · usada nos horários de oração`}
              onPress={() => {
                setCity(p?.city ?? '');
                setEditingCity(true);
              }}
              right={<Ionicons name="chevron-forward" size={14} color={colors.muted} />}
            />
          )}
        </Card>
      </View>
    </View>
  );
}

function ReminderRow({ reminder: r, last }: { reminder: Reminder; last: boolean }) {
  const toast = useToast();
  const { update, remove } = useReminderMutations();
  const [hovered, setHovered] = useState(false);

  return (
    <View onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <View style={styles.reminder}>
        <Text style={[styles.time, !r.enabled && styles.off]}>{r.time}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, !r.enabled && styles.off]}>{r.label}</Text>
          <Text style={styles.meta}>{r.days}</Text>
        </View>
        <Pressable
          onPress={() => remove.mutate(r.id, { onSuccess: () => toast('Lembrete excluído.'), onError: (e) => toast(e.message) })}
          accessibilityLabel={`Excluir ${r.label}`}
          hitSlop={8}
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <Ionicons name="trash-outline" size={16} color={colors.muted} />
        </Pressable>
        <Toggle
          label={r.label}
          value={r.enabled}
          onChange={(v) => update.mutate({ id: r.id, enabled: v }, { onError: (e) => toast(e.message) })}
        />
      </View>
      {!last && <Divider />}
    </View>
  );
}

function NewReminder({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const { create } = useReminderMutations();
  const [time, setTime] = useState('');
  const [label, setLabel] = useState('');
  const [days, setDays] = useState(DAY_OPTIONS[0]);

  function save() {
    const t = time.trim().padStart(5, '0');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return toast('Informe o horário no formato HH:MM.');
    if (!label.trim()) return toast('Dê um nome ao lembrete.');
    create.mutate(
      { time: t, label, days },
      {
        onSuccess: () => {
          toast('Lembrete criado.');
          onClose();
        },
        onError: (e) => toast(e.message),
      }
    );
  }

  return (
    <Card style={{ gap: 14 }}>
      <Eyebrow>Novo lembrete</Eyebrow>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TextInput
          value={time}
          onChangeText={(v) => setTime(v.replace(/[^\d:]/g, '').slice(0, 5))}
          placeholder="07:30"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { width: 96 }]}
          accessibilityLabel="Horário"
        />
        <TextInput
          value={label}
          onChangeText={setLabel}
          onSubmitEditing={save}
          placeholder="Nome (ex.: Oração da manhã)"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { flex: 1 }]}
          accessibilityLabel="Nome do lembrete"
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {DAY_OPTIONS.map((d) => (
          <Chip key={d} label={d} active={d === days} onPress={() => setDays(d)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title="Salvar lembrete" size="sm" loading={create.isPending} onPress={save} />
        <Button title="Cancelar" size="sm" variant="tertiary" onPress={onClose} />
      </View>
    </Card>
  );
}

function PrefRow({ title, sub, right, onPress }: { title: string; sub?: string; right?: ReactNode; onPress?: () => void }) {
  const body = (
    <View style={styles.prefRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.prefTitle}>{title}</Text>
        {sub ? <Text style={styles.meta}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button">
      {body}
    </Pressable>
  ) : (
    body
  );
}

const styles = StyleSheet.create({
  newBtn: { height: 42, paddingHorizontal: 20 },
  row: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  list: { paddingVertical: 8 },
  reminder: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: 17 },
  time: { fontFamily: fonts.serif, fontSize: 21, color: colors.title, width: 84 },
  label: { fontFamily: fonts.regular, fontSize: 16, color: colors.navy },
  off: { color: colors.text },
  meta: { ...type.meta, fontSize: 13, color: colors.text, marginTop: 2 },
  note: { ...type.meta, color: colors.muted, paddingHorizontal: 4 },
  empty: { paddingVertical: 20, gap: 6 },
  emptyTitle: { ...type.cardTitle, color: colors.title },
  prefs: { width: 362, paddingTop: 26 },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  prefTitle: { fontFamily: fonts.medium, fontSize: 15, color: colors.navy },
  input: {
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radii.field,
    backgroundColor: colors.white,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.navy,
    outlineStyle: 'none',
  } as object,
});
