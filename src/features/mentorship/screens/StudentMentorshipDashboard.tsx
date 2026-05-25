import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { StudentBookingCalendar } from '@/features/mentorship/components/calendar/StudentBookingCalendar';
import { UpcomingSessionsPanel } from '@/features/mentorship/components/calendar/UpcomingSessionsPanel';
import { CoachDashboardSummary } from '@/features/mentorship/components/student/CoachDashboardSummary';
import { CoachProfileCard } from '@/features/mentorship/components/student/CoachProfileCard';
import { SessionsTable } from '@/features/mentorship/components/student/SessionsTable';
import { WaitingListCard } from '@/features/mentorship/components/student/WaitingListCard';
import { MatchedBanner } from '@/features/mentorship/components/shared/MatchedBanner';
import { MentorshipChat } from '@/features/mentorship/components/shared/MentorshipChat';
import { MentorshipShell } from '@/features/mentorship/components/shared/MentorshipShell';
import {
  STUDENT_NAV_ITEMS,
  STUDENT_SECTION_TITLES,
} from '@/features/mentorship/constants/nav-items';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMentorshipActions } from '@/features/mentorship/hooks/useMentorshipActions';
import { useMentorshipSchedulingRealtime } from '@/features/mentorship/hooks/useMentorshipSchedulingRealtime';
import {
  filterSessionsForMentorship,
  useMentorshipSessions,
  useSessionMutations,
} from '@/features/mentorship/hooks/useMentorshipSessions';
import { useMentorshipMessages } from '@/features/mentorship/hooks/useMentorshipMessages';
import { useStudentMentorship } from '@/features/mentorship/hooks/useStudentMentorship';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { colors, spacing } from '@/constants/theme';
import { confirmAction } from '@/utils/confirm-action';

export function StudentMentorshipDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [activeSection, setActiveSection] = useState('dashboard');

  const {
    activeMentorship,
    openRequest,
    waitingList,
    coach,
    isLoading,
    error,
    refetch,
  } = useStudentMentorship();

  const {
    requestCoach,
    isRequesting,
    cancelRequest,
    isCancelling,
    leaveMentorship,
    isLeaving,
  } = useMentorshipActions();

  const mentorshipId = activeMentorship?.id;
  const mentorId = activeMentorship?.mentorId;

  useMentorshipSchedulingRealtime(userId, mentorshipId);
  const { messages, isLoading: messagesLoading, sendMessage, isSending } =
    useMentorshipMessages(mentorshipId, {
      enabled: activeSection === 'messages' && Boolean(mentorshipId),
      poll: activeSection === 'messages',
    });
  const { sessions, isLoading: sessionsLoading } = useMentorshipSessions(userId);
  const { book, cancel, isBooking } = useSessionMutations(userId);

  const mySessions = mentorshipId
    ? filterSessionsForMentorship(sessions, mentorshipId)
    : [];
  const myUpcoming = mentorshipId
    ? filterSessionsForMentorship(sessions, mentorshipId).filter(
        (s) => s.status !== 'cancelled' && s.status !== 'completed',
      )
    : [];

  const handleRequestCoach = () => {
    if (!user?.id) return;
    requestCoach(undefined);
  };

  const handleLeave = async () => {
    if (!activeMentorship) return;
    const ok = await confirmAction(
      'Leave mentorship',
      'You can request a new coach after leaving. This cannot be undone.',
    );
    if (!ok) return;
    leaveMentorship({ mentorshipId: activeMentorship.id });
  };

  const handleCancelSession = (sessionId: string) => {
    Alert.alert('Cancel session', 'Cancel this session?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          void cancel(sessionId, 'Cancelled by student').catch((e: Error) =>
            Alert.alert('Cannot cancel', e.message),
          );
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={mentorshipColors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load'} />
        <Button onPress={() => void refetch()}>Retry</Button>
      </View>
    );
  }

  const hasCoach = Boolean(activeMentorship);
  const onWaitingList = openRequest?.status === 'waiting_list' && waitingList;
  const canRequest = !hasCoach && !openRequest;
  const coachName = coach?.profile?.fullName?.trim() || 'Your coach';

  const navItems = STUDENT_NAV_ITEMS.filter((i) => (hasCoach ? true : i.id !== 'leave'));
  const sectionTitle = STUDENT_SECTION_TITLES[activeSection] ?? 'Mentorship';
  const isFullHeightSection = activeSection === 'messages';

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <View style={styles.sectionBody}>
            {canRequest ? (
              <Button fullWidth onPress={handleRequestCoach} loading={isRequesting}>
                Request a Coach
              </Button>
            ) : null}
            {openRequest?.status === 'pending' ? (
              <View style={styles.statusCard}>
                <Text>Finding a compatible coach…</Text>
              </View>
            ) : null}
            {onWaitingList && waitingList ? (
              <WaitingListCard
                status={waitingList}
                onCancel={() => cancelRequest(openRequest?.id)}
                isCancelling={isCancelling}
              />
            ) : null}
            {hasCoach && activeMentorship ? (
              <>
                <MatchedBanner endsAt={activeMentorship.endsAt} />
                <CoachDashboardSummary
                  profile={coach?.profile ?? null}
                  mentor={coach?.mentor ?? null}
                  onViewProfile={() => setActiveSection('coach')}
                />
              </>
            ) : null}
            {!canRequest && !hasCoach && !onWaitingList ? (
              <EmptyState
                title="No active mentorship"
                description="Request a coach to get started."
              />
            ) : null}
          </View>
        );

      case 'coach':
        if (!hasCoach) {
          return <Text muted>Match with a coach to view their profile.</Text>;
        }
        return (
          <CoachProfileCard
            profile={coach?.profile ?? null}
            mentor={coach?.mentor ?? null}
            endsAt={activeMentorship?.endsAt}
          />
        );

      case 'messages':
        if (!hasCoach || !mentorshipId) {
          return <Text muted>Match with a coach to start messaging.</Text>;
        }
        return (
          <MentorshipChat
            messages={messages}
            currentUserId={userId}
            mentorshipId={mentorshipId}
            isLoading={messagesLoading}
            isSending={isSending}
            onSend={sendMessage}
            peerName={coachName}
            peerAvatarUrl={coach?.profile?.avatarUrl}
            fullScreen
            emptyHint="Send a message to your coach about goals, sessions, or feedback."
          />
        );

      case 'book':
        if (!hasCoach || !mentorshipId || !mentorId) {
          return <Text muted>Match with a coach to book sessions.</Text>;
        }
        return (
          <View style={styles.sectionBody}>
            <StudentBookingCalendar
              coachId={mentorId}
              coachName={coachName}
              mentorshipId={mentorshipId}
              sessions={mySessions}
              onBook={async (input) => {
                await book(input);
              }}
              isBooking={isBooking}
              isLoadingSessions={sessionsLoading}
            />
            <UpcomingSessionsPanel
              sessions={mySessions}
              role="student"
              peerLabel={coachName}
              onCancel={handleCancelSession}
            />
          </View>
        );

      case 'sessions':
        if (!hasCoach) {
          return <Text muted>No sessions yet.</Text>;
        }
        if (sessionsLoading) {
          return <ActivityIndicator color={mentorshipColors.accent} />;
        }
        return (
          <SessionsTable
            sessions={myUpcoming}
            coachName={coachName}
            onCancel={handleCancelSession}
          />
        );

      case 'leave':
        return (
          <View style={styles.sectionBody}>
            <Text muted style={styles.leaveHint}>
              End your current mentorship. You may request a new coach later.
            </Text>
            <Button
              variant="secondary"
              onPress={() => void handleLeave()}
              loading={isLeaving}
              textStyle={{ color: colors.error }}
            >
              Leave mentorship
            </Button>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <MentorshipShell
      navItems={navItems}
      activeSection={activeSection}
      sectionTitle={sectionTitle}
      onSelectSection={setActiveSection}
      onRefresh={() => void refetch()}
      scrollable={!isFullHeightSection}
    >
      {renderSection()}
    </MentorshipShell>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  sectionBody: { gap: spacing.md },
  statusCard: {
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: mentorshipColors.surface,
  },
  leaveHint: { marginBottom: spacing.sm },
});
