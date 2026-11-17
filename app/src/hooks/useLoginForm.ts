import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type LoginMode = 'login' | 'signup';

/** Estado e envio do formulário de e-mail e senha (entrar ou criar conta). Web e celular. */
export function useLoginForm({ defaultRemember = false } = {}) {
  const { signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState<LoginMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(defaultRemember);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function toggleShowPassword() {
    setShowPassword((v) => !v);
  }

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError(null);
    setNotice(null);
  }

  function forgotPassword() {
    setError(null);
    setNotice(
      'A recuperação de senha por e-mail ainda não está disponível. Se a sua conta usa um e-mail Google, entre com “Continuar com o Google”.'
    );
  }

  async function handleLogin() {
    if (loading) return;
    setNotice(null);
    const signup = mode === 'signup';
    if (signup && !name.trim()) return setError('Informe seu nome.');
    if (!email.trim()) return setError('Informe seu e-mail.');
    if (!password) return setError('Informe sua senha.');
    if (signup && password.length < 8) return setError('A senha precisa ter pelo menos 8 caracteres.');

    setError(null);
    setLoading(true);
    try {
      if (signup) await signUpWithPassword(name.trim(), email.trim(), password, remember);
      else await signInWithPassword(email.trim(), password, remember);
      // Sucesso: o AuthContext troca o usuário e o roteador leva para as telas logadas.
    } catch (err) {
      setError((err as Error).message || 'Não foi possível entrar agora. Tente de novo.');
      setLoading(false);
    }
  }

  return {
    mode,
    toggleMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    remember,
    setRemember,
    loading,
    error,
    notice,
    forgotPassword,
    handleLogin,
  };
}
