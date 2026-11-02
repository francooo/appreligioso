import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link } from 'expo-router';
import { useToast } from '../../components/Toast';
import { Card, Divider, Eyebrow, FilterPills, PageHeader } from '../../components/ui';
import { SavedItem, SavedType } from '../../lib/api';
import { shortDate } from '../../lib/format';
import { useSaved, useToggleSaved } from '../../lib/queries';
import { colors, fonts, type } from '../../theme';

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'passagem', label: 'Passagens' },
  { key: 'oracao', label: 'Orações' },
  { key: 'reflexao', label: 'Reflexões' },
  { key: 'plano', label: 'Planos' },
] as const;

const TYPE_LABEL: Record<SavedType, string> = {
  passagem: 'Passagem',
  oracao: 'Oração',
  reflexao: 'Reflexão',
  plano: 'Plano',
};

const TYPE_HREF: Record<SavedType, string> = {
  passagem: '/leituras/palavra',
  oracao: '/orar/oracoes',
  reflexao: '/leituras/palavra',
  plano: '/leituras/planos',
};

// W15 · Perfil — Salvos
export function SavedWeb() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('todos');
  const saved = useSaved(filter === 'todos' ? undefined : filter);
  const { width } = useWindowDimensions();
  const columns = width >= 1180 ? 3 : width >= 760 ? 2 : 1;
  const items = saved.data ?? [];

  return (
    <View style={{ gap: 24 }}>
      <PageHeader
        eyebrow="Perfil"
        title="Salvos"
        right={<FilterPills options={FILTERS} value={filter} onChange={setFilter} />}
      />

      {saved.isLoading ? (
        <Text style={styles.empty}>Carregando…</Text>
      ) : items.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nada salvo {filter === 'todos' ? 'ainda' : 'nesta categoria'}.</Text>
          <Text style={styles.empty}>
            Toque em “Salvar” numa passagem, oração ou plano para encontrá-lo aqui depois.
          </Text>
        </Card>
      ) : (
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.id} style={{ width: `${100 / columns}%`, padding: 10 }}>
              <SavedCard item={item} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function SavedCard({ item }: { item: SavedItem }) {
  const toggle = useToggleSaved();
  const toast = useToast();
  const isQuote = item.type === 'passagem';

  return (
    <Card style={styles.card}>
      <View style={{ gap: 10 }}>
        <Eyebrow>{TYPE_LABEL[item.type]}</Eyebrow>
        <Text style={[styles.title, isQuote && styles.quote]}>{item.title}</Text>
        {item.subtitle ? <Text style={styles.sub}>{item.subtitle}</Text> : null}
      </View>
      <View>
        <Divider style={{ marginVertical: 14 }} />
        <View style={styles.footer}>
          <Text style={styles.date}>Salvo em {shortDate(item.created_at)}</Text>
          <View style={styles.footerActions}>
            <Pressable
              onPress={() =>
                toggle.mutate(
                  { savedId: item.id, type: item.type, key: item.key, title: item.title },
                  { onSuccess: () => toast('Removido dos salvos.'), onError: (e) => toast(e.message) }
                )
              }
              hitSlop={6}
            >
              <Text style={styles.remove}>Remover</Text>
            </Pressable>
            <Link href={TYPE_HREF[item.type] as never} style={styles.open}>
              Abrir →
            </Link>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -10 },
  card: { flex: 1, minHeight: 200, justifyContent: 'space-between' },
  title: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 25, color: colors.title },
  quote: { fontSize: 20, lineHeight: 27 },
  sub: { ...type.meta, fontSize: 13, color: colors.text },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  date: { ...type.meta, color: colors.muted },
  remove: { ...type.meta, color: colors.muted },
  open: { fontFamily: fonts.medium, fontSize: 13, color: colors.navy },
  emptyCard: { alignItems: 'flex-start', gap: 8, paddingVertical: 32 },
  emptyTitle: { ...type.cardTitle, color: colors.title },
  empty: { ...type.body, fontSize: 15, color: colors.text },
});
