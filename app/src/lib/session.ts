import * as SecureStore from 'expo-secure-store';

// Android/iOS: token da sessão no armazenamento seguro do aparelho. A web usa session.web.ts.
const KEY = 'lumina.session';

export const sessionStorage = {
  get: () => SecureStore.getItemAsync(KEY),
  // No celular a sessão sempre persiste; `remember` só tem efeito na web.
  set: (token: string, _remember?: boolean) => SecureStore.setItemAsync(KEY, token),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
