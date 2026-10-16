import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Dunes } from '../components/Dunes';
import { SunLogo } from '../components/SunLogo';
import { TextField } from '../components/TextField';
import { colors, fonts, radius } from '../theme';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Preencha e-mail e senha');
      return;
    }
    // TODO: ligar ao endpoint de autenticação do backend (Vercel)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Dunes />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <SunLogo />
            <Text style={styles.logo}>Lumina</Text>
            <View style={styles.divider} />
          </View>

          <Text style={styles.title}>Um instante{'\n'}para a sua fé.</Text>
          <Text style={styles.subtitle}>Palavras que acolhem e{'\n'}acompanham seu caminho.</Text>

          <View style={styles.form}>
            <TextField
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextField
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              right={
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={10}
                  accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={colors.muted}
                  />
                </Pressable>
              }
            />
            <Pressable style={styles.forgot} hitSlop={8}>
              <Text style={styles.link}>Esqueci a senha</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </Pressable>

          <Text style={styles.signup}>
            Ainda não tem conta? <Text style={styles.linkBold}>Criar conta</Text>
          </Text>

          <View style={styles.spacer} />

          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>Com respeito a todas as crenças.</Text>
            <View style={styles.footerLine} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  brand: { alignItems: 'center' },
  logo: { fontFamily: fonts.serif, fontSize: 44, color: colors.navy, marginTop: 2 },
  divider: { width: 44, height: 1, backgroundColor: colors.gold, marginTop: 14 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 36,
    lineHeight: 42,
    color: colors.navy,
    textAlign: 'center',
    marginTop: 28,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'center',
    marginTop: 14,
  },
  form: { marginTop: 32, gap: 18 },
  forgot: { alignSelf: 'flex-end', marginTop: -6 },
  link: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy },
  button: {
    height: 52,
    borderRadius: radius,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontFamily: fonts.semibold, fontSize: 18, color: colors.white, letterSpacing: 0.3 },
  signup: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  linkBold: { fontFamily: fonts.semibold, color: colors.navy },
  spacer: { flex: 1, minHeight: 60 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.muted },
  footerText: { fontFamily: fonts.regular, fontSize: 12, color: colors.text },
});
