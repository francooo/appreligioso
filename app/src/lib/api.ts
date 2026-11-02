const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  tradition: string | null;
};

export type Intention = {
  id: string;
  text: string;
  tag: string | null;
  status: 'active' | 'answered';
  created_at: string;
  answered_at: string | null;
};

export type JournalEntry = {
  id: string;
  entry_date: string;
  items: string[];
  mood: string | null;
  created_at: string;
};

export type Reminder = { id: string; time: string; label: string; days: string; enabled: boolean };

export type Preferences = {
  notify_prayer: boolean;
  notify_word: boolean;
  notify_news: boolean;
  sound: string;
  vibration: boolean;
  dnd: boolean;
  dnd_start: string;
  dnd_end: string;
  city: string | null;
};

export type SavedType = 'passagem' | 'oracao' | 'reflexao' | 'plano';
export type SavedItem = {
  id: string;
  type: SavedType;
  key: string;
  title: string;
  subtitle: string | null;
  created_at: string;
};

export type Progress = { plan_key: string; plan_title: string; step: number; total: number; updated_at: string };

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function request<T>(path: string, init?: RequestInit & { token?: string | null }): Promise<T> {
  const { token, ...rest } = init ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.ok === false) {
    throw new ApiError(body.error ?? `Erro ${res.status}`, res.status);
  }
  return body as T;
}

export function loginWithGoogle(idToken: string) {
  return request<{ token: string; user: User }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

export function fetchMe(token: string) {
  return request<{ user: User }>('/api/auth/me', { token });
}

export async function checkApiDatabase() {
  if (!API_URL) {
    console.warn('EXPO_PUBLIC_API_URL não definida — pulando health check.');
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/health/db`);
    const body = await res.json();
    console.log(body.ok ? 'Banco conectado:' : 'Falha no banco:', body);
  } catch (err) {
    console.warn('API indisponível:', err);
  }
}
