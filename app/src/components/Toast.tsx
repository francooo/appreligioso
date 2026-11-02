import { ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows } from '../theme';

// Avisos curtos ("Salvo", "Áudio em breve"). Alert.alert não funciona na web.
const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2800);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message ? (
        <View pointerEvents="none" style={styles.wrap}>
          <View style={styles.toast} accessibilityRole="alert">
            <Text style={styles.text}>{message}</Text>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 28, alignItems: 'center' },
  toast: {
    backgroundColor: colors.navy,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.pill,
    boxShadow: shadows.popover,
  },
  text: { fontFamily: fonts.medium, fontSize: 14, color: colors.white },
});
