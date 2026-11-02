// Web: token da sessão no localStorage ("Manter conectado") ou só na aba atual.
const KEY = 'lumina.session';

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export const sessionStorage = {
  get: async () =>
    safe(() => window.localStorage.getItem(KEY) ?? window.sessionStorage.getItem(KEY), null),
  set: async (token: string, remember = true) =>
    safe(() => (remember ? window.localStorage : window.sessionStorage).setItem(KEY, token), undefined),
  clear: async () =>
    safe(() => {
      window.localStorage.removeItem(KEY);
      window.sessionStorage.removeItem(KEY);
    }, undefined),
};
