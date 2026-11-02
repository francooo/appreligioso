const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
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
  return request<{ user: User }>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
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
