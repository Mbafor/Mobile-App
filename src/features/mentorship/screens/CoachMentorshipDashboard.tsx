import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { CoachSchedulingCalendar } from '@/features/mentorship/components/calendar/CoachSchedulingCalendar';
import { UpcomingSessionsPanel } from '@/features/mentorship/components/calendar/UpcomingSessionsPanel';
import { CapacityBadge } from '@/features/mentorship/components/coach/CapacityBadge';
import { CoachMessagesView } from '@/features/mentorship/components/coach/CoachMessagesView';
import { CoachNotificationsPanel } from '@/features/mentorship/components/coach/CoachNotificationsPanel';
import { CoachSessionsTable } from '@/features/mentorship/components/coach/CoachSessionsTable';
import { MenteesTable } from '@/features/mentorship/components/coach/MenteesTable';
import { MentorshipShell } from '@/features/mentorship/components/shared/MentorshipShell';
import {
  COACH_NAV_ITEMS,
  COACH_SECTION_TITLES,
} from '@/features/mentorship/constants/nav-items';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCoachMentorship } from '@/features/mentorship/hooks/useCoachMentorship';
import { useMentorshipSchedulingRealtime } from '@/features/mentorship/hooks/useMentorshipSchedulingRealtime';
import { useMentorshipActions } from '@/features/mentorship/hooks/useMentorshipActions';
import { useCoachThreadPreviews } from '@/features/mentorship/hooks/useCoachThreadPreviews';
import {
  useMentorshipSessions,
  useSessionMutations,
} from '@/features/mentorship/hooks/useMentorshipSessions';
import { queryKeys } from '@/constants/query-keys';
import { mentorshipDataApi, mentorshipSchedulingApi } from '@/services/api';
import { spacing } from '@/constants/theme';

export function CoachMentorshipDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('dashboard');

  const { mentees, capacity, isLoading, error, refetch } = useCoachMentorship();
  const { removeMentee, isRemoving } = useMentorshipActions();
  const { completed, sessions, isLoading: sessionsLoading } = useMentorshipSessions(userId);
  const { update, cancel, confirm } = useSessionMutations(userId);
  useMentorshipSchedulingRealtime(userId);

  const mentorshipIds = mentees.map((m) => m.mentorship.id);
  const { previewsByMentorshipId } = useCoachThreadPreviews(
    activeSection === 'notifications' ? mentorshipIds : [],
  );

  const messagesByMentorship = Object.fromEntries(
    Object.entries(previewsByMentorshipId).map(([id, msg]) => [id, msg ? [msg] : []]),
  );

  const sectionTitle = COACH_SECTION_TITLES[activeSection] ?? 'Mentorship';
  const isFullHeightSection = activeSection === 'messages';

  const handleConfirmSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const mentee = mentees.find((m) => m.mentorship.id === session.mentorshipId);
    const coachProfile = await mentorshipDataApi.getParticipantProfile(userId);
    const coachEmail = coachProfile.success ? coachProfile.data?.email : null;
    const studentEmail = mentee?.profile.email;

    if (!coachEmail || !studentEmail) {
      Alert.alert(
        'Missing emails',
        'Coach and student need email addresses on their profiles for Google Calendar invites.',
      );
      return;
    }

    try {
      const result = await mentorshipSchedulingApi.createGoogleCalendarEvent({
        sessionId,
        coachEmail,
        studentEmail,
        scheduledStart: session.scheduledStart,
        scheduledEnd: session.scheduledEnd,
        timezone: session.timezone,
        title: session.title ?? 'Mentorship session',
      });
      if (!result.success) {
        await confirm(sessionId);
        void queryClient.invalidateQueries({ queryKey: ['mentorship', 'sessions'] });
        Alert.alert(
          'Session confirmed',
          `Google Meet link could not be created: ${result.error.message}\n\nYou can add a meeting URL manually.`,
        );
        return;
      }
      await confirm(sessionId, result.data.meetingUrl);
      Alert.alert('Session confirmed', 'Google Meet link has been added for this session.');
      void queryClient.invalidateQueries({ queryKey: ['mentorship', 'sessions'] });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not confirm session.');
    }
  };

  const handleCancelSession = (sessionId: string) => {
    Alert.alert('Cancel session', 'Cancel this session? The student will be notified.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          void cancel(sessionId, 'Cancelled by coach').catch((e: Error) =>
            Alert.alert('Error', e.message),
          );
        },
      },
    ]);
  };

  const handleSetMeetingUrl = async (sessionId: string, url: string) => {
    await update(sessionId, { meetingUrl: url, status: 'confirmed' });
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
      </View>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <View style={styles.sectionBody}>
            {capacity ? (
              <CapacityBadge
                activeCount={capacity.activeCount}
                maxStudents={capacity.maxStudents}
              />
            ) : null}
            <MenteesTable
              mentees={mentees}
              onRemove={(id) => removeMentee({ mentorshipId: id, reason: 'Removed by coach' })}
              isRemoving={isRemoving}
            />
          </View>
        );

      case 'messages':
        return <CoachMessagesView mentees={mentees} currentUserId={userId} />;

      case 'availability':
        return (
          <View style={styles.sectionBody}>
            <CoachSchedulingCalendar
              coachId={userId}
              sessions={sessions}
              isLoadingSessions={sessionsLoading}
            />
            <UpcomingSessionsPanel
              sessions={sessions}
              role="coach"
              getPeerName={(session) => {
                const mentee = mentees.find((m) => m.mentorship.id === session.mentorshipId);
                return mentee?.profile.fullName?.trim() || 'Student';
              }}
              onConfirm={handleConfirmSession}
              onCancel={handleCancelSession}
            />
          </View>
        );

      case 'sessions':
        if (sessionsLoading) {
          return <ActivityIndicator color={mentorshipColors.accent} />;
        }
        return (
          <View style={styles.sectionBody}>
            <CoachSessionsTable
              title="Upcoming"
              sessions={sessions.filter(
                (s) => s.status !== 'cancelled' && s.status !== 'completed',
              )}
              onConfirm={handleConfirmSession}
              onCancel={handleCancelSession}
              onSetMeetingUrl={handleSetMeetingUrl}
            />
            <CoachSessionsTable title="Completed" sessions={completed} />
          </View>
        );

      case 'notifications':
        return (
          <CoachNotificationsPanel
            mentees={mentees}
            sessions={sessions}
            messagesByMentorship={messagesByMentorship}
            currentUserId={userId}
          />
        );

      default:
        return null;
    }
  };

  return (
    <MentorshipShell
      navItems={COACH_NAV_ITEMS}
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
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  sectionBody: { gap: spacing.md },
});
