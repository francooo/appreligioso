import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { renderGoogleButton } from '../lib/google.web';
import { fonts } from '../theme';

// Web: renderiza o botão oficial do Google Identity Services.
export function GoogleSignInButton({ remember = true }: { remember?: boolean }) {
  const { signInWithGoogleIdToken } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const rememberRef = useRef(remember);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);

  rememberRef.current = remember;

  useEffect(() => {
    const node = containerRef.current;
    if (!node || width === 0) return;
    renderGoogleButton(node, width, async (idToken) => {
      setError(null);
      try {
        await signInWithGoogleIdToken(idToken, rememberRef.current);
      } catch (err) {
        setError((err as Error).message);
      }
    }).catch((err) => setError((err as Error).message));
  }, [width, signInWithGoogleIdToken]);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <div ref={containerRef} style={{ minHeight: 44, display: 'flex', justifyContent: 'center' }} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  error: { fontFamily: fonts.regular, fontSize: 13, color: '#B42318', textAlign: 'center', marginTop: 8 },
});
