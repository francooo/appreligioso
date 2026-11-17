import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { Card, Eyebrow, PageHeader } from '../../components/ui';
import { AiConversation, AiMessage } from '../../lib/api';
import { relativeAge } from '../../lib/format';
import { useAiChat, useAiConversation, useAiConversations, useDeleteAiConversation, useTradition } from '../../lib/queries';
import { colors, fonts, radii, type } from '../../theme';

const SUGGESTIONS = [
  'Estou ansioso(a). Uma palavra de conforto?',
  'Como posso rezar quando não sinto vontade?',
  'Me ajude a perdoar alguém.',
];

// Orar — Guia espiritual (chat com IA)
export function GuideWeb() {
  const rel = useTradition();
  const toast = useToast();
  const { width } = useWindowDimensions();
  const wide = width >= 1100;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<string | null>(null);

  const conversations = useAiConversations('chat');
  const conversation = useAiConversation(conversationId);
  const chat = useAiChat();
  const remove = useDeleteAiConversation();

  const messages: AiMessage[] = conversationId ? (conversation.data?.messages ?? []) : [];

  function send(text = draft) {
    const message = text.trim();
    if (!message || chat.isPending) return;
    setPending(message);
    setDraft('');
    chat.mutate(
      { conversationId, message },
      {
        onSuccess: ({ conversation: c }) => setConversationId(c.id),
        onError: (e) => {
          setDraft(message);
          toast(e.message);
        },
        onSettled: () => setPending(null),
      }
    );
  }

  function open(c: AiConversation | null) {
    setConversationId(c?.id ?? null);
    setShowList(false);
  }

  const list = (
    <Card style={[styles.list, wide && styles.listWide]}>
      <Button
        title="Nova conversa"
        size="sm"
        icon={<Ionicons name="add" size={16} color={colors.white} />}
        onPress={() => open(null)}
      />
      {conversations.isLoading ? (
        <Text style={styles.meta}>Carregando…</Text>
      ) : (conversations.data ?? []).length === 0 ? (
        <Text style={styles.meta}>Suas conversas vão aparecer aqui.</Text>
      ) : (
        conversations.data!.map((c) => {
          const active = c.id === conversationId;
          return (
            <View key={c.id} style={[styles.convRow, active && styles.convActive]}>
              <Pressable style={{ flex: 1 }} onPress={() => open(c)} accessibilityRole="button">
                <Text style={styles.convTitle} numberOfLines={1}>
                  {c.title}
                </Text>
                <Text style={styles.meta}>{relativeAge(c.updated_at, 'Atualizada')}</Text>
              </Pressable>
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Excluir conversa"
                onPress={() =>
                  remove.mutate(c.id, {
                    onSuccess: () => {
                      if (active) setConversationId(null);
                      toast('Conversa excluída.');
                    },
                    onError: (e) => toast(e.message),
                  })
                }
              >
                <Ionicons name="trash-outline" size={16} color={colors.muted} />
              </Pressable>
            </View>
          );
        })
      )}
    </Card>
  );

  return (
    <View style={{ gap: 24 }}>
      <PageHeader
        eyebrow="Orar"
        title="Guia espiritual"
        right={
          wide ? undefined : (
            <Button
              title={showList ? 'Fechar conversas' : 'Conversas'}
              size="sm"
              variant="tertiary"
              icon={<Ionicons name="chatbubbles-outline" size={14} color={colors.navy} />}
              onPress={() => setShowList((s) => !s)}
            />
          )
        }
      />

      <View style={[styles.row, !wide && styles.column]}>
        {wide || showList ? list : null}

        <Card style={[styles.chat, wide && { flex: 1 }]}>
          {messages.length === 0 && !pending ? (
            conversationId && conversation.isLoading ? (
              <ActivityIndicator color={colors.gold} />
            ) : (
              <View style={styles.empty}>
                <Ionicons name="sparkles" size={22} color={colors.gold} />
                <Text style={styles.emptyTitle}>Converse com calma</Text>
                <Text style={styles.emptyText}>
                  Um guia que responde dentro da tradição {rel.name.toLowerCase()}. Escreva o que está no seu coração ou
                  comece por uma sugestão.
                </Text>
                <View style={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable key={s} style={styles.suggestion} onPress={() => send(s)} accessibilityRole="button">
                      <Text style={styles.suggestionText}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )
          ) : (
            <View style={{ gap: 14 }}>
              {messages.map((m) => (
                <Bubble key={m.id} role={m.role} content={m.content} />
              ))}
              {pending ? (
                <>
                  <Bubble role="user" content={pending} />
                  <View style={styles.typing}>
                    <ActivityIndicator size="small" color={colors.gold} />
                    <Text style={styles.meta}>Escrevendo…</Text>
                  </View>
                </>
              ) : null}
            </View>
          )}

          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Escreva sua mensagem…"
              placeholderTextColor={colors.placeholder}
              multiline
              maxLength={2000}
              style={styles.input}
              accessibilityLabel="Mensagem para o guia"
              onKeyPress={(e) => {
                // Web: Enter envia, Shift+Enter quebra linha.
                const ev = e.nativeEvent as { key: string; shiftKey?: boolean };
                if (ev.key === 'Enter' && !ev.shiftKey) {
                  (e as unknown as { preventDefault?: () => void }).preventDefault?.();
                  send();
                }
              }}
            />
            <Pressable
              onPress={() => send()}
              disabled={!draft.trim() || chat.isPending}
              accessibilityRole="button"
              accessibilityLabel="Enviar"
              style={[styles.send, (!draft.trim() || chat.isPending) && { opacity: 0.4 }]}
            >
              <Ionicons name="arrow-up" size={18} color={colors.white} />
            </Pressable>
          </View>
          <Text style={[styles.meta, { textAlign: 'center' }]}>
            Gerado por IA · não substitui orientação profissional ou religiosa. Em crise, ligue 188 (CVV).
          </Text>
        </Card>
      </View>
    </View>
  );
}

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const mine = role === 'user';
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      {!mine ? <Eyebrow style={{ marginBottom: 6 }}>Guia</Eyebrow> : null}
      <Text style={[styles.bubbleText, mine && { color: colors.white }]} selectable>
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  list: { gap: 10 },
  listWide: { width: 300 },
  convRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12 },
  convActive: { backgroundColor: colors.sand },
  convTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.navy },
  chat: { gap: 18, minHeight: 520 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 24, maxWidth: 520, alignSelf: 'center' },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 24, color: colors.title },
  emptyText: { ...type.body, fontSize: 15, lineHeight: 23, color: colors.text, textAlign: 'center' },
  suggestions: { gap: 8, marginTop: 8, alignSelf: 'stretch' },
  suggestion: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radii.field,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  suggestionText: { fontFamily: fonts.regular, fontSize: 14, color: colors.navy },
  bubble: { maxWidth: '88%', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.navy, borderBottomRightRadius: 6 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.sand, borderBottomLeftRadius: 6 },
  bubbleText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.body },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radii.field,
    backgroundColor: colors.white,
    padding: 8,
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 160,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.navy,
    outlineStyle: 'none',
  } as object,
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  meta: { ...type.meta, color: colors.muted },
});
