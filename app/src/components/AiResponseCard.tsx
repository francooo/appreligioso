import { ActivityIndicator, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AiReply, SavedType } from '../lib/api';
import { useSaved, useToggleSaved } from '../lib/queries';
import { shareText } from '../lib/share';
import { colors, fonts, radii, type } from '../theme';
import { Button } from './Button';
import { useToast } from './Toast';
import { Eyebrow } from './ui';

type Props = {
  /** Rótulo no topo, ex.: "Reflexão com IA". */
  label: string;
  loading: boolean;
  error?: Error | null;
  data?: AiReply;
  onRegenerate: () => void;
  /** Como salvar em Perfil · Salvos. */
  saveAs: { type: SavedType; subtitle: string };
  style?: StyleProp<ViewStyle>;
};

/** Resposta gerada pela IA, com Gerar de novo · Salvar · Compartilhar. Serve web e celular. */
export function AiResponseCard({ label, loading, error, data, onRegenerate, saveAs, style }: Props) {
  const toast = useToast();
  const saved = useSaved(saveAs.type);
  const toggleSaved = useToggleSaved();
  const key = data ? `ai:${data.conversation.id}` : '';
  const savedItem = saved.data?.find((s) => s.key === key);

  async function share() {
    if (!data) return;
    try {
      const r = await shareText(`${data.reply}\n\n— Lumina`);
      if (r === 'copied') toast('Texto copiado para compartilhar.');
    } catch {
      toast('Não foi possível compartilhar agora.');
    }
  }

  return (
    <View style={[styles.card, style]} accessibilityLiveRegion="polite">
      <View style={styles.head}>
        <Ionicons name="sparkles" size={14} color={colors.goldText} />
        <Eyebrow>{label}</Eyebrow>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.meta}>Escrevendo com calma…</Text>
        </View>
      ) : error ? (
        <View style={{ gap: 12 }}>
          <Text style={styles.error}>{error.message}</Text>
          <Button title="Tentar de novo" size="sm" variant="tertiary" style={{ alignSelf: 'flex-start' }} onPress={onRegenerate} />
        </View>
      ) : data ? (
        <>
          <Text style={styles.reply} selectable>
            {data.reply}
          </Text>
          <View style={styles.actions}>
            <Button title="Gerar de novo" size="sm" variant="tertiary" onPress={onRegenerate} />
            <Button
              title={savedItem ? 'Salvo' : 'Salvar'}
              size="sm"
              variant="tertiary"
              loading={toggleSaved.isPending}
              icon={savedItem ? <Ionicons name="bookmark" size={13} color={colors.gold} /> : undefined}
              onPress={() =>
                toggleSaved.mutate(
                  {
                    savedId: savedItem?.id,
                    type: saveAs.type,
                    key,
                    title: data.reply.length > 300 ? `${data.reply.slice(0, 297)}…` : data.reply,
                    subtitle: saveAs.subtitle,
                  },
                  {
                    onSuccess: () => toast(savedItem ? 'Removido dos salvos.' : 'Salvo em Perfil · Salvos.'),
                    onError: (e) => toast(e.message),
                  }
                )
              }
            />
            <Button title="Compartilhar" size="sm" variant="tertiary" onPress={share} />
          </View>
          <Text style={styles.meta}>Gerado por IA · pode conter imprecisões</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.sand, borderRadius: radii.card, padding: 20, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  reply: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 26, color: colors.body },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: { ...type.meta, color: colors.muted },
  error: { fontFamily: fonts.regular, fontSize: 14, color: colors.danger },
});
