import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Text } from '@/components/ui';
import { EmptyState } from '@/components/feedback';
import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import {
  AttachMenuSheet,
  type AttachMenuAction,
} from '@/features/mentorship/components/shared/AttachMenuSheet';
import { EmojiPickerSheet } from '@/features/mentorship/components/shared/EmojiPickerSheet';
import { TypingIndicator } from '@/features/mentorship/components/shared/TypingIndicator';
import type { SendMessageInput } from '@/features/mentorship/hooks/useMentorshipMessages';
import { useMentorshipTyping } from '@/features/mentorship/hooks/useMentorshipTyping';
import {
  attachmentErrorMessage,
  pickDocument,
  pickPhotoFromCamera,
  pickPhotoFromLibrary,
  showAttachmentError,
} from '@/features/mentorship/utils/pick-mentorship-attachment';
import { spacing } from '@/constants/theme';
import type { MentorshipMessage } from '@/types/domain/mentorship';
import { openExternalUrl } from '@/utils/web/openExternalUrl';

type MentorshipChatProps = {
  messages: MentorshipMessage[];
  currentUserId: string;
  mentorshipId: string;
  isLoading?: boolean;
  isSending?: boolean;
  onSend: (input: SendMessageInput | string) => Promise<void>;
  emptyHint?: string;
  peerName?: string;
  peerAvatarUrl?: string | null;
  fullScreen?: boolean;
};

function attachmentLabel(item: MentorshipMessage, t: TFunction): string | null {
  if (!item.attachmentUrl) return null;
  if (item.attachmentType === 'image') return null;
  const body = item.body?.trim() ?? '';
  if (body.startsWith('📎 ')) return body.slice(2);
  if (body && body !== 'Attachment' && body !== 'Photo') return body;
  return t('mentorship.chat.documentFallback');
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateDivider(date: Date, t: TFunction, locale: string): string {
  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diffDays === 0) return t('mentorship.chat.dateToday');
  if (diffDays === 1) return t('mentorship.chat.dateYesterday');
  if (diffDays > 1 && diffDays < 7) {
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: target.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

type ChatListItem =
  | { type: 'divider'; id: string; label: string }
  | { type: 'message'; id: string; message: MentorshipMessage };

function buildChatListItems(messages: MentorshipMessage[], t: TFunction, locale: string): ChatListItem[] {
  const items: ChatListItem[] = [];
  let lastDateKey: string | null = null;
  for (const message of messages) {
    const created = new Date(message.createdAt);
    const dateKey = created.toDateString();
    if (dateKey !== lastDateKey) {
      items.push({ type: 'divider', id: `divider-${dateKey}`, label: formatDateDivider(created, t, locale) });
      lastDateKey = dateKey;
    }
    items.push({ type: 'message', id: message.id, message });
  }
  return items;
}

export function MentorshipChat({
  messages,
  currentUserId,
  mentorshipId,
  isLoading,
  isSending,
  onSend,
  emptyHint: emptyHintProp,
  peerName: peerNameProp,
  peerAvatarUrl,
  fullScreen = false,
}: MentorshipChatProps) {
  const styles = useAppThemedStyles(createStyles);
  const { mentorshipColors } = useTheme();
  const { t, i18n } = useTranslation();
  const emptyHint = emptyHintProp ?? t('mentorship.chat.emptyHintDefault');
  const peerName = peerNameProp ?? t('mentorship.chat.them');
  const [draft, setDraft] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const listRef = useRef<FlatList>(null);
  const chatItems = useMemo(
    () => buildChatListItems(messages, t, i18n.language),
    [messages, t, i18n.language],
  );
  const hasText = draft.trim().length > 0;
  const canSend = hasText && !isSending && !uploading;
  const canAttach = Boolean(mentorshipId?.trim()) && !isSending && !uploading;

  const { peerTyping, onDraftChange } = useMentorshipTyping(mentorshipId, currentUserId, true);
  const composerBottomPad = spacing.sm;
  const listBottomPad = spacing.sm;

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || isSending || uploading) return;
    try {
      await onSend(text);
      setDraft('');
      onDraftChange('');
      listRef.current?.scrollToEnd({ animated: true });
    } catch (e) {
      Alert.alert(
        t('mentorship.chat.messageFailedTitle'),
        e instanceof Error ? e.message : t('mentorship.chat.messageFailedBody'),
      );
    }
  };

  const sendPickedAttachment = async (picked: {
    uri: string;
    attachmentType: 'image' | 'file';
    fileName: string;
    mimeType?: string;
  }) => {
    if (!mentorshipId?.trim()) {
      Alert.alert(t('mentorship.chat.cannotAttachTitle'), t('mentorship.chat.cannotAttachBody'));
      return;
    }
    setUploading(true);
    try {
      await onSend({
        body: draft.trim(),
        localAttachmentUri: picked.uri,
        attachmentType: picked.attachmentType,
        fileName: picked.fileName,
        mimeType: picked.mimeType,
      });
      setDraft('');
      onDraftChange('');
      listRef.current?.scrollToEnd({ animated: true });
    } catch (e) {
      showAttachmentError(e);
    } finally {
      setUploading(false);
    }
  };

  const handleAttachAction = async (action: AttachMenuAction) => {
    try {
      if (action === 'library') {
        const picked = await pickPhotoFromLibrary();
        if (picked) await sendPickedAttachment(picked);
        return;
      }
      if (action === 'camera') {
        const picked = await pickPhotoFromCamera();
        if (picked) await sendPickedAttachment(picked);
        return;
      }
      if (action === 'document') {
        const picked = await pickDocument();
        if (picked) await sendPickedAttachment(picked);
      }
    } catch (e) {
      const msg = attachmentErrorMessage(e);
      if (msg) showAttachmentError(e);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, fullScreen && styles.fullScreen]}>
        <ActivityIndicator color={mentorshipColors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.wrap, fullScreen && styles.fullScreen]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {peerName ? (
        <View style={styles.peerHeader}>
          <UserAvatarDisplay displayName={peerName} avatarUrl={peerAvatarUrl ?? null} size={40} />
          <View style={styles.peerMeta}>
            <Text style={styles.peerName}>{peerName}</Text>
            <Text variant="caption" muted>
              {t('mentorship.chat.conversation')}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.messageStream}>
        {messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState title={t('mentorship.chat.noMessages')} description={emptyHint} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={styles.list}
            data={chatItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: listBottomPad }]}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              if (messages.length > 0) {
                listRef.current?.scrollToEnd({ animated: true });
              }
            }}
            renderItem={({ item: listItem }) => {
              if (listItem.type === 'divider') {
                return (
                  <View style={styles.dateDividerRow}>
                    <View style={styles.dateDividerPill}>
                      <Text style={styles.dateDividerText}>{listItem.label}</Text>
                    </View>
                  </View>
                );
              }

              const item = listItem.message;
              const mine = item.senderId === currentUserId;
              const time = new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const fileLabel = attachmentLabel(item, t);
              const showImage =
                item.attachmentUrl && item.attachmentType === 'image';
              const showFile =
                item.attachmentUrl && item.attachmentType === 'file';
              const showText =
                item.body &&
                item.body !== 'Photo' &&
                !item.body.startsWith('📎 ');

              return (
                <View
                  style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}
                >
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    {showImage ? (
                      <Pressable onPress={() => void openExternalUrl(item.attachmentUrl!)}>
                        <Image source={{ uri: item.attachmentUrl }} style={styles.image} />
                      </Pressable>
                    ) : null}
                    {showFile ? (
                      <Pressable
                        style={[styles.fileChip, mine && styles.fileChipMine]}
                        onPress={() => void openExternalUrl(item.attachmentUrl!)}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={22}
                          color={mine ? mentorshipColors.textOnAccent : mentorshipColors.accent}
                        />
                        <Text
                          style={[styles.fileChipText, mine && styles.fileChipTextMine]}
                          numberOfLines={2}
                        >
                          {fileLabel}
                        </Text>
                      </Pressable>
                    ) : null}
                    {showText ? (
                      <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>
                        {item.body}
                      </Text>
                    ) : null}
                    <Text style={[styles.time, mine && styles.timeMine]}>{time}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      <TypingIndicator visible={peerTyping} peerName={peerName} />

      <View style={[styles.composerBar, { paddingBottom: composerBottomPad }]}>
        <Pressable
          style={[styles.attachBtn, !canAttach && styles.attachBtnDisabled]}
          onPress={() => setAttachOpen(true)}
          disabled={!canAttach}
          accessibilityRole="button"
          accessibilityLabel={t('mentorship.chat.attach')}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={mentorshipColors.accent} />
          ) : (
            <Ionicons name="add" size={26} color={mentorshipColors.accent} />
          )}
        </Pressable>

        <View style={styles.inputWrap}>
          <TextInput
            value={draft}
            onChangeText={(text) => {
              setDraft(text);
              onDraftChange(text);
            }}
            placeholder={t('mentorship.chat.messagePlaceholder')}
            placeholderTextColor={mentorshipColors.textMuted}
            style={styles.input}
            multiline
            maxLength={2000}
            textAlignVertical="center"
          />
          <Pressable
            style={styles.emojiBtn}
            onPress={() => setEmojiOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('mentorship.chat.emoji')}
          >
            <Ionicons name="happy-outline" size={22} color={mentorshipColors.textMuted} />
          </Pressable>
        </View>

        <Pressable
          style={[styles.sendBtn, canSend && styles.sendBtnActive]}
          onPress={() => void handleSend()}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={t('mentorship.chat.send')}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={mentorshipColors.textOnAccent} />
          ) : (
            <Ionicons name="paper-plane" size={16} color={mentorshipColors.textOnAccent} />
          )}
        </Pressable>
      </View>

      <AttachMenuSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onSelect={(action) => void handleAttachAction(action)}
      />

      <EmojiPickerSheet
        visible={emojiOpen}
        onClose={() => setEmojiOpen(false)}
        onSelect={(emoji) => {
          const next = draft + emoji;
          setDraft(next);
          onDraftChange(next);
        }}
      />
    </KeyboardAvoidingView>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: {
    minHeight: 320,
    flexDirection: 'column',
  },
  fullScreen: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messageStream: {
    flex: 1,
    minHeight: 0,
    // Prevent bubbles from overflowing and causing page-level scrolling.
    // The FlatList inside should be the only vertical scroll region.
    overflow: 'hidden',
  },
  peerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
    marginBottom: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.border,
  },
  peerMeta: { flex: 1, gap: 2 },
  peerName: { fontSize: 15, fontWeight: '600', color: mentorshipColors.text },
  emptyWrap: { flex: 1, justifyContent: 'center' },
  list: { flex: 1, minHeight: 0 },
  listContent: {
    flexGrow: 1,
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  dateDividerRow: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  dateDividerPill: {
    backgroundColor: mentorshipColors.bubbleTheirs,
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  dateDividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: mentorshipColors.textMuted,
  },
  bubbleRow: { flexDirection: 'row', width: '100%' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: mentorshipColors.accent,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: mentorshipColors.bubbleTheirs,
    borderBottomLeftRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
    color: mentorshipColors.text,
  },
  bubbleTextMine: { color: mentorshipColors.textOnAccent },
  image: {
    width: 200,
    height: 160,
    borderRadius: 12,
    marginBottom: 2,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
    maxWidth: 220,
  },
  fileChipMine: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  fileChipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: mentorshipColors.text,
  },
  fileChipTextMine: { color: mentorshipColors.textOnAccent },
  time: {
    fontSize: 11,
    color: mentorshipColors.text,
    opacity: 0.72,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  timeMine: { color: mentorshipColors.textOnAccent, opacity: 0.88 },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: mentorshipColors.border,
    backgroundColor: mentorshipColors.surfaceElevated,
  },
  attachBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachBtnDisabled: { opacity: 0.4 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    maxHeight: 100,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    backgroundColor: mentorshipColors.surfaceElevated,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: mentorshipColors.border,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    fontSize: 15,
    lineHeight: 19,
    color: mentorshipColors.text,
    maxHeight: 100,
  },
  emojiBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: mentorshipColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.45,
  },
  sendBtnActive: {
    opacity: 1,
  },
});
}
