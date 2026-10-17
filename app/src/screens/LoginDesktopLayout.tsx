import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Dunes } from '../components/Dunes';
import { OrDivider } from '../components/OrDivider';
import { SunLogo } from '../components/SunLogo';
import { TextField } from '../components/TextField';
import { useLoginForm } from '../hooks/useLoginForm';
import { colors, fonts, shadow } from '../theme';

export function LoginDesktopLayout() {
  const { height } = useWindowDimensions();
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    remember,
    setRemember,
    handleLogin,
  } = useLoginForm();

  return (
    <View style={styles.page}>
      <Dunes variant="wide" height={Math.round(height * 0.34)} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandColumn}>
          <View style={styles.brand}>
            <SunLogo size={140} />
            <Text style={styles.logo}>Lumina</Text>
            <View style={styles.divider} />
            <Text style={styles.title}>Um instante{'\n'}para a sua fé.</Text>
            <Text style={styles.subtitle}>Palavras que acolhem e{'\n'}acompanham seu caminho.</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>COM RESPEITO{'\n'}A TODAS AS CRENÇAS.</Text>
            <View style={styles.footerLine} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>BEM VINDA(O) DE VOLTA</Text>
          <Text style={styles.cardTitle}>Que bom ter você{'\n'}por aqui.</Text>
          <Text style={styles.cardSubtitle}>Entre para continuar sua jornada de fé.</Text>

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
              onSubmitEditing={handleLogin}
              right={
                <Pressable
                  onPress={toggleShowPassword}
                  hitSlop={10}
                  accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.muted}
                  />
                </Pressable>
              }
            />

            <View style={styles.optionsRow}>
              <Checkbox label="Manter conectado" checked={remember} onChange={setRemember} />
              <Pressable hitSlop={8}>
                <Text style={styles.link}>Esqueci a senha</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.actions}>
            <Button title="Entrar" onPress={handleLogin} />
            <OrDivider />
            <Button title="Criar uma conta gratuita" variant="outline" />
          </View>

          <Text style={styles.legal}>
            Ao continuar, você concorda com nossos{'\n'}
            <Text style={styles.legalLink}>Termos de uso</Text> e{' '}
            <Text style={styles.legalLink}>Política de privacidade</Text>.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 48,
    paddingHorizontal: 64,
    gap: 48,
  },
  brandColumn: { flex: 1, justifyContent: 'space-between' },
  brand: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 160 },
  logo: { fontFamily: fonts.serif, fontSize: 76, color: colors.navy, marginTop: 4 },
  divider: { width: 64, height: 1, backgroundColor: colors.gold, marginTop: 20 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 68,
    lineHeight: 76,
    color: colors.navy,
    textAlign: 'center',
    marginTop: 36,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 24,
    lineHeight: 34,
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
  footer: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 3,
    color: colors.text,
  },
  footerLine: { width: 72, height: 1, backgroundColor: colors.gold, marginBottom: 6 },
  card: {
    width: 540,
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    boxShadow: shadow,
    paddingHorizontal: 56,
    paddingVertical: 52,
  },
  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 3,
    color: colors.gold,
  },
  cardTitle: {
    fontFamily: fonts.serif,
    fontSize: 42,
    lineHeight: 48,
    color: colors.navy,
    marginTop: 14,
  },
  cardSubtitle: { fontFamily: fonts.regular, fontSize: 16, color: colors.text, marginTop: 12 },
  form: { marginTop: 32, gap: 18 },
  optionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy },
  actions: { marginTop: 28, gap: 20 },
  legal: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 20,
    color: colors.text,
    textAlign: 'center',
    marginTop: 28,
  },
  legalLink: { fontFamily: fonts.semibold, color: colors.navy },
});
