import { Platform, useWindowDimensions } from 'react-native';

/** Larguras de referência: celular (< 700), tablet/janela média, desktop web (≥ 1024 com sidebar). */
export function useLayout() {
  const { width } = useWindowDimensions();
  return {
    width,
    /** Sidebar do mockup web. No app nativo nunca, mesmo em tablet. */
    isDesktop: Platform.OS === 'web' && width >= 1024,
    /** Telas de celular: uma coluna, paddings menores, ações empilhadas. */
    isNarrow: width < 700,
  };
}
