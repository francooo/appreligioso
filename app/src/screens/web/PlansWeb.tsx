import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Button } from '../../components/Button';
import { PlanCover } from '../../components/PlanCover';
import { useToast } from '../../components/Toast';
import { Card, Eyebrow, FilterPills, PageHeader, ProgressBar } from '../../components/ui';
import { PLAN_FILTERS, PlanFilter, matchesFilter, plansOf, progressLabel, progressPct } from '../../content/plans';
import { usePlanProgress, useSaveProgress, useTradition, useTraditionKey } from '../../lib/queries';
import { Progress } from '../../lib/api';
import { colors, fonts, radii, shadows, type } from '../../theme';

// W7 · Leituras — Planos de leitura
export function PlansWeb() {
  const rel = useTradition();
  const trad = useTraditionKey();
  const toast = useToast();
  const progress = usePlanProgress();
  const save = useSaveProgress();
  const { width } = useWindowDimensions();
  const columns = width >= 1180 ? 4 : width >= 760 ? 2 : 1;

  const [filter, setFilter] = useState<PlanFilter>('todos');
  const [query, setQuery] = useState('');

  const plans = useMemo(() => plansOf(trad, rel), [trad, rel]);
  const byKey = new Map((progress.data ?? []).map((p) => [p.plan_key, p]));
  const current = progress.data?.find((p) => p.step < p.total);

  const visible = plans.filter(
    (p) => matchesFilter(p, filter) && p.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  function advance(p: Progress) {
    const step = Math.min(p.step + 1, p.total);
    save.mutate(
      { plan_key: p.plan_key, plan_title: p.plan_title, step, total: p.total },
      {
        onSuccess: () =>
          toast(step >= p.total ? `Plano “${p.plan_title}” concluído!` : `Dia ${step} de ${p.total} marcado como lido.`),
        onError: (e) => toast(e.message),
      }
    );
  }

  function start(key: string, title: string, total: number) {
    save.mutate(
      { plan_key: key, plan_title: title, step: 0, total },
      { onSuccess: () => toast(`Plano “${title}” iniciado.`), onError: (e) => toast(e.message) }
    );
  }

  return (
    <View style={{ gap: 24 }}>
      <PageHeader
        eyebrow="Leituras"
        title="Planos de leitura"
        right={
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar planos…"
            placeholderTextColor={colors.placeholder}
            style={styles.search}
            accessibilityLabel="Buscar planos"
          />
        }
      />

      {current ? (
        <Card style={styles.current}>
          <PlanCover style={styles.currentCover} />
          <View style={{ flex: 1, gap: 8 }}>
            <Eyebrow>Em andamento</Eyebrow>
            <Text style={styles.currentTitle}>{current.plan_title}</Text>
            <Text style={styles.meta}>{progressLabel(current)}</Text>
            <ProgressBar value={progressPct(current)} style={{ marginTop: 6, maxWidth: 460 }} />
          </View>
          <Button title="Continuar leitura" loading={save.isPending} onPress={() => advance(current)} />
        </Card>
      ) : (
        <Card style={styles.current}>
          <PlanCover style={styles.currentCover} />
          <View style={{ flex: 1, gap: 8 }}>
            <Eyebrow>Em andamento</Eyebrow>
            <Text style={styles.currentTitle}>Nenhum plano em andamento</Text>
            <Text style={styles.meta}>Escolha um plano abaixo para começar, no seu ritmo.</Text>
          </View>
        </Card>
      )}

      <View style={styles.exploreHead}>
        <Text style={styles.sectionTitle}>Explorar planos</Text>
        <FilterPills options={PLAN_FILTERS} value={filter} onChange={setFilter} />
      </View>

      {visible.length === 0 ? (
        <Text style={styles.meta}>Nenhum plano encontrado.</Text>
      ) : (
        <View style={styles.grid}>
          {visible.map((plan) => {
            const p = byKey.get(plan.key);
            const done = p && p.step >= p.total;
            return (
              <View key={plan.key} style={{ width: `${100 / columns}%`, padding: 10 }}>
                <Card padded={false} style={styles.planCard}>
                  <PlanCover style={styles.planCover} />
                  <View style={styles.planBody}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <View style={styles.planFoot}>
                      <Text style={styles.meta}>{p ? progressLabel(p) : plan.duration}</Text>
                      <PlanAction
                        label={done ? 'Recomeçar →' : p ? 'Continuar →' : 'Começar →'}
                        onPress={() => (p && !done ? advance(p) : start(plan.key, plan.title, plan.total))}
                      />
                    </View>
                  </View>
                </Card>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function PlanAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <Text style={styles.action}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: {
    width: 298,
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
  current: { flexDirection: 'row', alignItems: 'center', gap: 28, padding: 28 },
  currentCover: { width: 180, height: 120 },
  currentTitle: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34, color: colors.title },
  meta: { ...type.meta, fontSize: 14, color: colors.text },
  exploreHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 24, color: colors.title },
  grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -10 },
  planCard: { flex: 1, padding: 14, boxShadow: shadows.card },
  planCover: { height: 120 },
  planBody: { paddingHorizontal: 4, paddingTop: 16, paddingBottom: 8, gap: 10, flex: 1 },
  planTitle: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 23, color: colors.title },
  planFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  action: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy },
});
