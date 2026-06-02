import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
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
import { TypingIndicator } from '@/features/mentorship/components/shared/TypingIndicator';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import type { SendMessageInput } from '@/features/mentorship/hooks/useMentorshipMessages';
import { useMentorshipTyping } from '@/features/mentorship/hooks/useMentorshipTyping';
import {
  attachmentErrorMessage,
  pickDocument,
  pickPhotoFromCamera,
  pickPhotoFromLibrary,
  showAttachmentError,
} from '@/features/mentorship/utils/pick-mentorship-attachment';
import { useMainTabBarHeight } from '@/constants/layout';
import { spacing } from '@/constants/theme';
import type { MentorshipMessage } from '@/types/domain/mentorship';

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

function attachmentLabel(item: MentorshipMessage): string | null {
  if (!item.attachmentUrl) return null;
  if (item.attachmentType === 'image') return null;
  const body = item.body?.trim() ?? '';
  if (body.startsWith('📎 ')) return body.slice(2);
  if (body && body !== 'Attachment' && body !== 'Photo') return body;
  return 'Document';
}

export function MentorshipChat({
  messages,
  currentUserId,
  mentorshipId,
  isLoading,
  isSending,
  onSend,
  emptyHint = 'Send a message to start the conversation.',
  peerName = 'Them',
  peerAvatarUrl,
  fullScreen = false,
}: MentorshipChatProps) {
  const [draft, setDraft] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const listRef = useRef<FlatList>(null);
  const hasText = draft.trim().length > 0;
  const canSend = hasText && !isSending && !uploading;
  const canAttach = Boolean(mentorshipId?.trim()) && !isSending && !uploading;

  const { peerTyping, onDraftChange } = useMentorshipTyping(mentorshipId, currentUserId, true);
  const tabBarHeight = useMainTabBarHeight();
  const composerBottomPad = fullScreen ? Math.max(tabBarHeight, spacing.sm) : spacing.sm;

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
        'Message failed',
        e instanceof Error ? e.message : 'Could not send your message. Try again.',
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
      Alert.alert('Cannot attach', 'No active mentorship conversation.');
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? tabBarHeight + 88 : 0}
    >
      {peerName ? (
        <View style={styles.peerHeader}>
          <UserAvatarDisplay displayName={peerName} avatarUrl={peerAvatarUrl ?? null} size={40} />
          <View style={styles.peerMeta}>
            <Text style={styles.peerName}>{peerName}</Text>
            <Text variant="caption" muted>
              Mentorship conversation
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.messageStream}>
        {messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState title="No messages yet" description={emptyHint} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={styles.list}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const mine = item.senderId === currentUserId;
              const time = new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const fileLabel = attachmentLabel(item);
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
                      <Pressable onPress={() => void Linking.openURL(item.attachmentUrl!)}>
                        <Image source={{ uri: item.attachmentUrl }} style={styles.image} />
                      </Pressable>
                    ) : null}
                    {showFile ? (
                      <Pressable
                        style={[styles.fileChip, mine && styles.fileChipMine]}
                        onPress={() => void Linking.openURL(item.attachmentUrl!)}
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
          accessibilityLabel="Attach photo or file"
        >
          {uploading ? (
            <ActivityIndicator size="small" color={mentorshipColors.accent} />
          ) : (
            <Ionicons name="attach" size={22} color={mentorshipColors.accent} />
          )}
        </Pressable>

        <TextInput
          value={draft}
          onChangeText={(text) => {
            setDraft(text);
            onDraftChange(text);
          }}
          placeholder="Message…"
          placeholderTextColor={mentorshipColors.textMuted}
          style={styles.input}
          multiline
          maxLength={2000}
          textAlignVertical="center"
        />

        <Pressable
          style={[styles.sendBtn, canSend && styles.sendBtnActive]}
          onPress={() => void handleSend()}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {isSending ? (
            <ActivityIndicator size="small" color={mentorshipColors.textOnAccent} />
          ) : (
            <Ionicons
              name="paper-plane"
              size={18}
              color={canSend ? mentorshipColors.textOnAccent : mentorshipColors.textMuted}
            />
          )}
        </Pressable>
      </View>

      <AttachMenuSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onSelect={(action) => void handleAttachAction(action)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  list: { flex: 1 },
  listContent: {
    flexGrow: 1,
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  bubbleRow: { flexDirection: 'row', width: '100%' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    paddingVertical: 6,
    paddingHorizontal: 12,
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
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: mentorshipColors.border,
    backgroundColor: mentorshipColors.surfaceElevated,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mentorshipColors.border,
    backgroundColor: mentorshipColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachBtnDisabled: { opacity: 0.4 },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    lineHeight: 20,
    color: mentorshipColors.text,
    backgroundColor: mentorshipColors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: mentorshipColors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: mentorshipColors.surface,
    borderWidth: 1,
    borderColor: mentorshipColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: mentorshipColors.accent,
    borderColor: mentorshipColors.accent,
  },
});
