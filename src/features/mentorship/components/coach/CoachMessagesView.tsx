import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Text } from '@/components/ui';
import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { MentorshipChat } from '@/features/mentorship/components/shared/MentorshipChat';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { useCoachThreadPreviews } from '@/features/mentorship/hooks/useCoachThreadPreviews';
import { useMentorshipMessages } from '@/features/mentorship/hooks/useMentorshipMessages';
import type { MenteeSummary } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type CoachMessagesViewProps = {
  mentees: MenteeSummary[];
  currentUserId: string;
  initialActiveMentorshipId?: string;
};

export function CoachMessagesView({
  mentees,
  currentUserId,
  initialActiveMentorshipId,
}: CoachMessagesViewProps) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;
  const [selectedId, setSelectedId] = useState<string | undefined>(() => {
    return initialActiveMentorshipId ?? mentees[0]?.mentorship.id;
  });
  const [showThreadList, setShowThreadList] = useState(isNarrow);
  const activeId = selectedId ?? mentees[0]?.mentorship.id;

  useEffect(() => {
    if (!initialActiveMentorshipId) return;
    if (initialActiveMentorshipId === selectedId) return;
    setSelectedId(initialActiveMentorshipId);
    if (isNarrow) setShowThreadList(false);
  }, [initialActiveMentorshipId, isNarrow, selectedId]);

  const mentorshipIds = mentees.map((m) => m.mentorship.id);
  const { previewsByMentorshipId } = useCoachThreadPreviews(mentorshipIds);
  const { messages, isLoading, sendMessage, isSending } = useMentorshipMessages(activeId, {
    enabled: Boolean(activeId),
    poll: true,
  });

  const activeMentee = mentees.find((m) => m.mentorship.id === activeId);
  const peerName = activeMentee?.profile.fullName?.trim() || 'Student';

  if (mentees.length === 0) {
    return <Text muted>No students to message.</Text>;
  }

  const selectStudent = (id: string) => {
    setSelectedId(id);
    if (isNarrow) setShowThreadList(false);
  };

  const threadList = (
    <View style={[styles.sidebar, isNarrow && styles.sidebarNarrow]}>
      <Text style={styles.sidebarTitle}>Students</Text>
      {mentees.map((m) => {
        const id = m.mentorship.id;
        const active = id === activeId;
        const name = m.profile.fullName?.trim() || 'Student';
        const preview = previewsByMentorshipId[id];
        const snippet = preview?.body ?? 'No messages yet';
        const unread = preview && preview.senderId !== currentUserId;

        return (
          <Pressable
            key={id}
            style={[styles.threadRow, active && styles.threadRowActive]}
            onPress={() => selectStudent(id)}
          >
            <UserAvatarDisplay
              displayName={name}
              avatarUrl={m.profile.avatarUrl ?? null}
              size={44}
            />
            <View style={styles.threadMeta}>
              <View style={styles.threadTop}>
                <Text style={[styles.threadName, active && styles.threadNameActive]} numberOfLines={1}>
                  {name}
                </Text>
                {unread ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text variant="caption" muted numberOfLines={2}>
                {snippet}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const chatPane = (
    <View style={[styles.chatPane, isNarrow && styles.chatPaneNarrow]}>
      {isNarrow ? (
        <Pressable style={styles.backBtn} onPress={() => setShowThreadList(true)}>
          <Text style={styles.backText}>← All students</Text>
        </Pressable>
      ) : null}
      <MentorshipChat
        messages={messages}
        currentUserId={currentUserId}
        mentorshipId={activeId ?? ''}
        isLoading={isLoading}
        isSending={isSending}
        onSend={sendMessage}
        peerName={peerName}
        peerAvatarUrl={activeMentee?.profile.avatarUrl}
        fullScreen
        emptyHint="Message this student about goals, sessions, or feedback."
      />
    </View>
  );

  if (isNarrow) {
    return (
      <View style={styles.rootNarrow}>
        {showThreadList ? threadList : chatPane}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {threadList}
      {chatPane}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
    backgroundColor: mentorshipColors.surfaceElevated,
  },
  rootNarrow: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  sidebar: {
    width: 220,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: mentorshipColors.border,
    backgroundColor: mentorshipColors.surface,
    paddingVertical: spacing.sm,
  },
  sidebarNarrow: {
    width: '100%',
    borderRightWidth: 0,
    flex: 1,
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: mentorshipColors.textMuted,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  threadRowActive: {
    backgroundColor: mentorshipColors.accentMuted,
    borderLeftWidth: 3,
    borderLeftColor: mentorshipColors.accent,
  },
  threadMeta: { flex: 1, gap: 2 },
  threadTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  threadName: { flex: 1, fontSize: 15, fontWeight: '600', color: mentorshipColors.text },
  threadNameActive: { color: mentorshipColors.accent },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: mentorshipColors.accent,
  },
  chatPane: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  chatPaneNarrow: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    padding: 0,
  },
  backBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  backText: { fontWeight: '600', color: mentorshipColors.accent, fontSize: 14 },
});
