import { useState } from 'react';
import { Alert } from 'react-native';

export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  function toggleShowPassword() {
    setShowPassword((v) => !v);
  }

  function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Preencha e-mail e senha');
      return;
    }
    // TODO: ligar ao endpoint de autenticação do backend (Vercel)
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    remember,
    setRemember,
    handleLogin,
  };
}
