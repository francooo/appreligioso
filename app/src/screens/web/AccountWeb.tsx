import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Dunes } from '../../components/Dunes';
import { TextField } from '../../components/TextField';
import { TraditionSelect } from '../../components/TraditionSelect';
import { useToast } from '../../components/Toast';
import { Avatar, Card, Divider, Eyebrow, PageHeader, Toggle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { usePreferences, useTradition, useUpdatePreferences, useUpdateProfile } from '../../lib/queries';
import { Preferences } from '../../lib/api';
import { colors, fonts, type } from '../../theme';

// W14 · Perfil — Conta e configurações
export function AccountWeb() {
  const { user, signOut } = useAuth();
  const rel = useTradition();
  const toast = useToast();
  const updateProfile = useUpdateProfile();
  const prefs = usePreferences();
  const updatePrefs = useUpdatePreferences();
  const { width } = useWindowDimensions();
  const wide = width >= 1180;

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [changingTradition, setChangingTradition] = useState(false);

  function saveName() {
    updateProfile.mutate(
      { name },
      {
        onSuccess: () => {
          setEditingName(false);
          toast('Nome atualizado.');
        },
        onError: (e) => toast(e.message),
      }
    );
  }

  const toggle = (key: keyof Preferences) => (value: boolean) =>
    updatePrefs.mutate({ [key]: value }, { onError: (e) => toast(e.message) });

  return (
    <View style={{ gap: 24 }}>
      <PageHeader eyebrow="Perfil" title="Conta e configurações" />

      <View style={[styles.row, !wide && styles.column]}>
        <View style={[styles.left, !wide && { width: '100%' }]}>
          <Card style={styles.profile}>
            <Avatar name={user?.name ?? user?.email} size={58} />
            {editingName ? (
              <View style={{ width: '100%', gap: 12, marginTop: 8 }}>
                <TextField label="Como podemos te chamar?" value={name} onChangeText={setName} onSubmitEditing={saveName} autoFocus />
                <View style={styles.inlineActions}>
                  <Button title="Salvar" size="sm" loading={updateProfile.isPending} onPress={saveName} />
                  <Button title="Cancelar" size="sm" variant="tertiary" onPress={() => setEditingName(false)} />
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.name}>{user?.name ?? 'Sem nome'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <Button
                  title="Editar perfil"
                  size="sm"
                  variant="outline"
                  style={{ marginTop: 16 }}
                  onPress={() => {
                    setName(user?.name ?? '');
                    setEditingName(true);
                  }}
                />
              </>
            )}
          </Card>

          <Card padded={false} style={styles.traditionCard}>
            <Dunes height="45%" />
            <View style={{ padding: 22, gap: 10 }}>
              <Eyebrow>Tradição de fé</Eyebrow>
              <View style={styles.traditionHead}>
                <Text style={styles.traditionName}>{rel.name}</Text>
                <Button
                  title={changingTradition ? 'Fechar' : 'Alterar'}
                  size="sm"
                  onPress={() => setChangingTradition((c) => !c)}
                />
              </View>
              {changingTradition ? (
                <TraditionSelect
                  variant="field"
                  value={user?.tradition}
                  onChange={(tradition) =>
                    updateProfile.mutate(
                      { tradition },
                      {
                        onSuccess: () => {
                          setChangingTradition(false);
                          toast('Tradição atualizada.');
                        },
                        onError: (e) => toast(e.message),
                      }
                    )
                  }
                />
              ) : (
                <Text style={styles.traditionText}>Define orações, leituras e lembretes que você vê no Lumina.</Text>
              )}
            </View>
          </Card>
        </View>

        <Card style={styles.settings}>
          <Eyebrow>Conta</Eyebrow>
          <Row label="Nome e foto" onPress={() => setEditingName(true)} />
          <Row label="E-mail" value={user?.email} />
          <Row label="Alterar senha" onPress={() => toast('Disponível quando o login com senha for ativado.')} last />

          <Eyebrow style={styles.section}>Notificações</Eyebrow>
          <Row label="Lembretes de oração" right={<Toggle label="Lembretes de oração" value={!!prefs.data?.notify_prayer} onChange={toggle('notify_prayer')} />} />
          <Row label="Palavra do dia" right={<Toggle label="Palavra do dia" value={!!prefs.data?.notify_word} onChange={toggle('notify_word')} />} />
          <Row
            label="Novidades do Lumina"
            right={<Toggle label="Novidades do Lumina" value={!!prefs.data?.notify_news} onChange={toggle('notify_news')} />}
            last
          />

          <Eyebrow style={styles.section}>Privacidade e termos</Eyebrow>
          <Row label="Privacidade do diário" onPress={() => toast('Seu diário é privado: só você vê seus registros.')} />
          <Row label="Termos de uso e Política de privacidade" onPress={() => toast('Os termos serão publicados em breve.')} last />

          <Pressable onPress={signOut} style={{ marginTop: 20 }} accessibilityRole="button">
            <Text style={styles.signOut}>Sair da conta</Text>
          </Pressable>
        </Card>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  right,
  onPress,
  last,
}: {
  label: string;
  value?: string | null;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const content = (
    <View style={styles.rowInner}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {right ?? (onPress || value ? <Ionicons name="chevron-forward" size={14} color={colors.muted} /> : null)}
      </View>
    </View>
  );
  return (
    <>
      {onPress ? (
        <Pressable onPress={onPress} accessibilityRole="button">
          {content}
        </Pressable>
      ) : (
        content
      )}
      {!last && <Divider />}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  column: { flexDirection: 'column' },
  left: { width: 380, gap: 20 },
  profile: { alignItems: 'center', paddingVertical: 28 },
  name: { fontFamily: fonts.serif, fontSize: 22, color: colors.title, marginTop: 14 },
  email: { ...type.meta, fontSize: 13, color: colors.text, marginTop: 4 },
  inlineActions: { flexDirection: 'row', gap: 8 },
  traditionCard: { overflow: 'hidden', minHeight: 156, zIndex: 5 },
  traditionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  traditionName: { fontFamily: fonts.serif, fontSize: 24, color: colors.title },
  traditionText: { ...type.meta, fontSize: 13, lineHeight: 19, color: colors.text },
  settings: { flex: 1, paddingTop: 22 },
  section: { marginTop: 26 },
  rowInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, gap: 12 },
  rowLabel: { fontFamily: fonts.regular, fontSize: 15, color: colors.navy },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  signOut: { fontFamily: fonts.medium, fontSize: 15, color: colors.danger },
});
