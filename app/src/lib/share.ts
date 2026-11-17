import { Platform, Share } from 'react-native';

/**
 * Compartilha um texto: folha nativa no celular, Web Share na web e, sem ela, copia.
 * Devolve 'copied' quando caiu na área de transferência (para avisar o usuário).
 */
export async function shareText(text: string): Promise<'shared' | 'copied' | 'cancelled'> {
  try {
    if (Platform.OS !== 'web') {
      await Share.share({ message: text });
      return 'shared';
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ text });
      return 'shared';
    }
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch (err) {
    if ((err as Error).name === 'AbortError') return 'cancelled';
    throw err;
  }
}
