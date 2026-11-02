import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { TEXTS_PREFIX, isPlanProgress } from '../content/plans';
import { DEFAULT_TRADITION, TRADITIONS, TraditionKey, getTradition } from '../content/traditions';
import {
  Intention,
  JournalEntry,
  Preferences,
  Progress,
  Reminder,
  SavedItem,
  SavedType,
  User,
  request,
} from './api';

// Hooks de dados do usuário (React Query). Cada um usa o token da sessão atual.

function useApi() {
  const { token } = useAuth();
  return <T,>(path: string, init?: RequestInit) => request<T>(path, { ...init, token });
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

/** Tradição de fé do usuário (Católica por padrão) com todo o conteúdo dela. */
export function useTradition() {
  const { user } = useAuth();
  return getTradition(user?.tradition);
}

/** Chave da tradição do usuário ("catolica", "islamica"...). */
export function useTraditionKey(): TraditionKey {
  const { user } = useAuth();
  const key = user?.tradition as TraditionKey | undefined;
  return key && key in TRADITIONS ? key : DEFAULT_TRADITION;
}

export function useUpdateProfile() {
  const api = useApi();
  const { setUser } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: { name?: string; tradition?: string }) =>
      api<{ user: User }>('/api/profile', json('PATCH', patch)),
    onSuccess: ({ user }) => {
      setUser(user);
      qc.invalidateQueries();
    },
  });
}

// ---------- intenções ----------
export function useIntentions(status?: 'active' | 'answered') {
  const api = useApi();
  return useQuery({
    queryKey: ['intentions', status ?? 'all'],
    queryFn: () => api<{ intentions: Intention[] }>(`/api/intentions${status ? `?status=${status}` : ''}`),
    select: (d) => d.intentions,
  });
}

export function useIntentionMutations() {
  const api = useApi();
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: ['intentions'] });
  return {
    create: useMutation({
      mutationFn: (v: { text: string; tag?: string | null }) =>
        api<{ intention: Intention }>('/api/intentions', json('POST', v)),
      onSuccess: done,
    }),
    update: useMutation({
      mutationFn: ({ id, ...patch }: { id: string; status?: Intention['status']; text?: string }) =>
        api<{ intention: Intention }>(`/api/intentions/${id}`, json('PATCH', patch)),
      onSuccess: done,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api(`/api/intentions/${id}`, { method: 'DELETE' }),
      onSuccess: done,
    }),
  };
}

// ---------- diário ----------
export function useJournal(params: { month?: string; q?: string; limit?: number } = {}) {
  const api = useApi();
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][]
  ).toString();
  return useQuery({
    queryKey: ['journal', params],
    queryFn: () => api<{ entries: JournalEntry[] }>(`/api/journal${qs ? `?${qs}` : ''}`),
    select: (d) => d.entries,
  });
}

export function useCreateJournalEntry() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { items: string[]; mood?: string | null }) =>
      api<{ entry: JournalEntry }>('/api/journal', json('POST', v)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  });
}

// ---------- salvos ----------
export function useSaved(type?: SavedType) {
  const api = useApi();
  return useQuery({
    queryKey: ['saved', type ?? 'all'],
    queryFn: () => api<{ saved: SavedItem[] }>(`/api/saved${type ? `?type=${type}` : ''}`),
    select: (d) => d.saved,
  });
}

/** Salvar/remover um item. `savedId` vem da lista de salvos (undefined = ainda não salvo). */
export function useToggleSaved() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { savedId?: string; type: SavedType; key: string; title: string; subtitle?: string | null }) =>
      v.savedId
        ? api(`/api/saved/${v.savedId}`, { method: 'DELETE' })
        : api('/api/saved', json('POST', { type: v.type, key: v.key, title: v.title, subtitle: v.subtitle })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved'] }),
  });
}

// ---------- progresso de leitura ----------
export function useProgress() {
  const api = useApi();
  return useQuery({
    queryKey: ['progress'],
    queryFn: () => api<{ progress: Progress[] }>('/api/progress'),
    select: (d) => d.progress,
  });
}

/** Só os planos de leitura (sem o "de onde parou" dos textos sagrados), mais recente primeiro. */
export function usePlanProgress() {
  const q = useProgress();
  return { ...q, data: q.data?.filter(isPlanProgress) };
}

/** Último livro/seção aberto nos textos sagrados da tradição atual. */
export function useLastText() {
  const q = useProgress();
  const trad = useTraditionKey();
  return { ...q, data: q.data?.find((p) => p.plan_key === `${TEXTS_PREFIX}${trad}`) };
}

export function useSaveProgress() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { plan_key: string; plan_title: string; step: number; total: number }) =>
      api<{ progress: Progress }>('/api/progress', json('PUT', v)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progress'] }),
  });
}

// ---------- lembretes e preferências ----------
export function useReminders() {
  const api = useApi();
  return useQuery({
    queryKey: ['reminders'],
    queryFn: () => api<{ reminders: Reminder[] }>('/api/reminders'),
    select: (d) => d.reminders,
  });
}

export function useReminderMutations() {
  const api = useApi();
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: ['reminders'] });
  return {
    create: useMutation({
      mutationFn: (v: { time: string; label: string; days?: string; enabled?: boolean }) =>
        api<{ reminder: Reminder }>('/api/reminders', json('POST', v)),
      onSuccess: done,
    }),
    update: useMutation({
      mutationFn: ({ id, ...patch }: { id: string } & Partial<Omit<Reminder, 'id'>>) =>
        api<{ reminder: Reminder }>(`/api/reminders/${id}`, json('PATCH', patch)),
      onMutate: async ({ id, ...patch }) => {
        // Toggle otimista na lista.
        await qc.cancelQueries({ queryKey: ['reminders'] });
        const prev = qc.getQueryData<{ reminders: Reminder[] }>(['reminders']);
        if (prev) qc.setQueryData(['reminders'], { reminders: prev.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
        return { prev };
      },
      onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(['reminders'], ctx.prev),
      onSettled: done,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api(`/api/reminders/${id}`, { method: 'DELETE' }),
      onSuccess: done,
    }),
  };
}

export function usePreferences() {
  const api = useApi();
  return useQuery({
    queryKey: ['preferences'],
    queryFn: () => api<{ preferences: Preferences }>('/api/preferences'),
    select: (d) => d.preferences,
  });
}

export function useUpdatePreferences() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Preferences>) =>
      api<{ preferences: Preferences }>('/api/preferences', json('PATCH', patch)),
    onMutate: async (patch) => {
      // Atualização otimista: o toggle muda na hora.
      await qc.cancelQueries({ queryKey: ['preferences'] });
      const prev = qc.getQueryData<{ preferences: Preferences }>(['preferences']);
      if (prev) qc.setQueryData(['preferences'], { preferences: { ...prev.preferences, ...patch } });
      return { prev };
    },
    onError: (_e, _p, ctx) => ctx?.prev && qc.setQueryData(['preferences'], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['preferences'] }),
  });
}
