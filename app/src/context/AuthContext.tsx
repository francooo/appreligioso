import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, User, fetchMe, loginWithGoogle } from '../lib/api';
import { googleSignOut } from '../lib/google';
import { sessionStorage } from '../lib/session';

type AuthState = {
  user: User | null;
  /** Token da sessão, enviado nas chamadas à API. */
  token: string | null;
  /** true enquanto restaura a sessão salva ao abrir o app. */
  restoring: boolean;
  signInWithGoogleIdToken: (idToken: string, remember?: boolean) => Promise<void>;
  /** Atualiza o usuário em memória depois de uma edição de perfil. */
  setUser: (user: User) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await sessionStorage.get();
        if (saved) {
          setUserState((await fetchMe(saved)).user);
          setToken(saved);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) await sessionStorage.clear();
        else console.warn('Não foi possível restaurar a sessão:', err);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const signInWithGoogleIdToken = useCallback(async (idToken: string, remember = true) => {
    const { token, user } = await loginWithGoogle(idToken);
    await sessionStorage.set(token, remember);
    setToken(token);
    setUserState(user);
  }, []);

  const setUser = useCallback((u: User) => setUserState(u), []);

  const signOut = useCallback(async () => {
    await sessionStorage.clear();
    await googleSignOut();
    setToken(null);
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, restoring, signInWithGoogleIdToken, setUser, signOut }),
    [user, token, restoring, signInWithGoogleIdToken, setUser, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
