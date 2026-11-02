import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, User, fetchMe, loginWithGoogle } from '../lib/api';
import { googleSignOut } from '../lib/google';
import { sessionStorage } from '../lib/session';

type AuthState = {
  user: User | null;
  /** true enquanto restaura a sessão salva ao abrir o app. */
  restoring: boolean;
  signInWithGoogleIdToken: (idToken: string, remember?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await sessionStorage.get();
        if (token) setUser((await fetchMe(token)).user);
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
    setUser(user);
  }, []);

  const signOut = useCallback(async () => {
    await sessionStorage.clear();
    await googleSignOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, restoring, signInWithGoogleIdToken, signOut }),
    [user, restoring, signInWithGoogleIdToken, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
