import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { requestGoogleIdToken } from '../lib/google';
import { colors, fonts, radius } from '../theme';

// Android/iOS. A web usa GoogleSignInButton.web.tsx (botão oficial do Google).
export function GoogleSignInButton({ remember = true }: { remember?: boolean }) {
  const { signInWithGoogleIdToken } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handlePress() {
    setLoading(true);
    try {
      const idToken = await requestGoogleIdToken();
      if (idToken) await signInWithGoogleIdToken(idToken, remember);
    } catch (err) {
      Alert.alert('Não foi possível entrar com Google', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={colors.navy} />
      ) : (
        <>
          <Ionicons name="logo-google" size={18} color={colors.navy} />
          <Text style={styles.text}>Continuar com Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pressed: { opacity: 0.85 },
  text: { fontFamily: fonts.medium, fontSize: 16, color: colors.navy },
});
