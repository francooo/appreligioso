import type { Progress } from '../lib/api';
import type { Tradition, TraditionKey } from './traditions';

// Planos de leitura da tradição (lumina-data.js) e helpers de progresso.

export type Plan = { key: string; title: string; duration: string; total: number };

/** "16 dias" → 16, "28 capítulos" → 28, "8 semanas" → 8, "semanal" → 7, "30 juz" → 30. */
export function parseTotal(duration: string) {
  const n = parseInt(duration, 10);
  if (Number.isFinite(n) && n > 0) return n;
  return 7;
}

export function plansOf(trad: TraditionKey, rel: Tradition): Plan[] {
  return rel.plans.map(([title, duration], i) => ({
    key: `${trad}:plano:${i}`,
    title,
    duration,
    total: parseTotal(duration),
  }));
}

/** Os textos sagrados guardam "de onde parou" na mesma tabela de progresso, com este prefixo. */
export const TEXTS_PREFIX = 'textos:';

export function isPlanProgress(p: Progress) {
  return !p.plan_key.startsWith(TEXTS_PREFIX);
}

/** "Dia 9 de 21" (dia atual = dias concluídos + 1) ou "Concluído". */
export function progressLabel(p: Pick<Progress, 'step' | 'total'>) {
  return p.step >= p.total ? 'Concluído' : `Dia ${p.step + 1} de ${p.total}`;
}

export function progressPct(p: Pick<Progress, 'step' | 'total'>) {
  return Math.round((p.step / p.total) * 100);
}

/** Curtos: até 14 dias. Para iniciantes: até um mês. */
export const PLAN_FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'curtos', label: 'Curtos' },
  { key: 'iniciantes', label: 'Para iniciantes' },
] as const;

export type PlanFilter = (typeof PLAN_FILTERS)[number]['key'];

export function matchesFilter(plan: Plan, filter: PlanFilter) {
  if (filter === 'curtos') return plan.total <= 14;
  if (filter === 'iniciantes') return plan.total <= 31;
  return true;
}
