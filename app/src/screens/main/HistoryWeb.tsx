import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from '../../components/Calendar';
import { useToast } from '../../components/Toast';
import { Card, PageHeader } from '../../components/ui';
import { JournalEntry } from '../../lib/api';
import { parseDate, weekdayShortDate } from '../../lib/format';
import { useDeleteJournalEntry, useJournal } from '../../lib/queries';
import { colors, fonts, radii, type } from '../../theme';

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

// W13 · Diário — Histórico
export function HistoryWeb() {
  const { width } = useWindowDimensions();
  const wide = width >= 1100;

  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [day, setDay] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // O calendário mostra o mês todo; a busca procura em todos os registros.
  const monthEntries = useJournal({ month: monthKey(month), limit: 200 });
  const searchEntries = useJournal({ q: debounced, limit: 50 });
  const searching = debounced.length > 0;

  const marked = useMemo(
    () => new Set((monthEntries.data ?? []).map((e) => parseDate(e.entry_date).getDate())),
    [monthEntries.data]
  );

  const list = searching
    ? searchEntries.data ?? []
    : (monthEntries.data ?? []).filter((e) => day === null || parseDate(e.entry_date).getDate() === day);
  const loading = searching ? searchEntries.isLoading : monthEntries.isLoading;

  const now = new Date();
  const isCurrentMonth = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();
  const shiftMonth = (n: number) => {
    setDay(null);
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  };

  return (
    <View style={{ gap: 24 }}>
      <PageHeader
        eyebrow="Diário"
        title="Histórico"
        right={
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar nos registros…"
            placeholderTextColor={colors.placeholder}
            style={styles.search}
            accessibilityLabel="Buscar nos registros"
          />
        }
      />

      <View style={[styles.row, !wide && styles.column]}>
        <Card style={[styles.calendar, !wide && { width: '100%' }]}>
          <Calendar
            month={month}
            marked={marked}
            selected={day}
            onSelect={(d) => setDay(day === d ? null : d)}
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
            nextDisabled={isCurrentMonth}
            legend="Dias com registro"
          />
        </Card>

        <View style={{ flex: 1, gap: 12 }}>
          {(day !== null || searching) && (
            <Text style={styles.filter}>
              {searching ? `Resultados para “${debounced}”` : `Registros do dia ${day}`}
              {!searching && (
                <Text style={styles.clear} onPress={() => setDay(null)}>
                  {'  '}· ver o mês todo
                </Text>
              )}
            </Text>
          )}
          {loading ? (
            <Text style={styles.meta}>Carregando…</Text>
          ) : list.length === 0 ? (
            <Card>
              <Text style={styles.meta}>
                {searching ? 'Nenhum registro encontrado.' : 'Nenhum registro neste mês. Que tal começar hoje, em Gratidão?'}
              </Text>
            </Card>
          ) : (
            list.map((e) => <EntryCard key={e.id} entry={e} />)
          )}
        </View>
      </View>
    </View>
  );
}

function EntryCard({ entry }: { entry: JournalEntry }) {
  const toast = useToast();
  const remove = useDeleteJournalEntry();
  const [hovered, setHovered] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <View onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <Card style={styles.entry}>
        <View style={styles.entryHead}>
          <Text style={styles.entryDate}>{weekdayShortDate(entry.entry_date)}</Text>
          <View style={styles.entryRight}>
            {confirming ? (
              <>
                <Text style={styles.meta}>Excluir este registro?</Text>
                <Text
                  style={styles.danger}
                  onPress={() =>
                    remove.mutate(entry.id, {
                      onSuccess: () => toast('Registro excluído.'),
                      onError: (e) => toast(e.message),
                    })
                  }
                >
                  Excluir
                </Text>
                <Text style={styles.cancel} onPress={() => setConfirming(false)}>
                  Cancelar
                </Text>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => setConfirming(true)}
                  accessibilityLabel="Excluir registro"
                  hitSlop={8}
                  // No toque não existe hover: no celular o botão fica sempre visível.
                  style={{ opacity: hovered || Platform.OS !== 'web' ? 1 : 0 }}
                >
                  <Ionicons name="trash-outline" size={15} color={colors.muted} />
                </Pressable>
                {entry.mood ? (
                  <View style={styles.mood}>
                    <Text style={styles.moodText}>{entry.mood}</Text>
                  </View>
                ) : null}
              </>
            )}
          </View>
        </View>
        {entry.items.map((it, i) => (
          <Text key={i} style={styles.entryText}>
            {it}
          </Text>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    width: 298,
    maxWidth: '100%',
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
  row: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  calendar: { width: 426, paddingHorizontal: 20, paddingVertical: 24 },
  filter: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy },
  clear: { fontFamily: fonts.regular, color: colors.text },
  entry: { paddingHorizontal: 22, paddingVertical: 18, gap: 8 },
  entryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  entryRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  entryDate: { fontFamily: fonts.serif, fontSize: 17, color: colors.title },
  entryText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.body },
  mood: { backgroundColor: colors.peach, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 },
  moodText: { fontFamily: fonts.medium, fontSize: 12, color: colors.tagText },
  meta: { ...type.meta, fontSize: 13, color: colors.text },
  danger: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger },
  cancel: { fontFamily: fonts.medium, fontSize: 13, color: colors.navy },
});
