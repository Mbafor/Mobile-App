import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { MenteeSummary } from '@/types/domain/mentorship';
import type { MentorshipMessage, MentorshipSession } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type CoachNotificationsPanelProps = {
  mentees: MenteeSummary[];
  sessions: MentorshipSession[];
  messagesByMentorship: Record<string, MentorshipMessage[]>;
  currentUserId: string;
};

export function CoachNotificationsPanel({
  mentees,
  sessions,
  messagesByMentorship,
  currentUserId,
}: CoachNotificationsPanelProps) {
  const styles = useAppThemedStyles(createStyles);
  const { t } = useTranslation();
  const recentMentees = useMemo(
    () =>
      mentees.filter((m) => {
        const started = new Date(m.mentorship.startedAt).getTime();
        return Date.now() - started < 7 * 24 * 60 * 60 * 1000;
      }),
    [mentees],
  );

  const upcomingReminders = useMemo(() => {
    const in24h = Date.now() + 24 * 60 * 60 * 1000;
    return sessions.filter((s) => {
      const start = new Date(s.scheduledStart).getTime();
      return (
        s.status !== 'cancelled' &&
        s.status !== 'completed' &&
        start > Date.now() &&
        start <= in24h
      );
    });
  }, [sessions]);

  const unreadThreads = useMemo(() => {
    return mentees.filter((m) => {
      const msgs = messagesByMentorship[m.mentorship.id] ?? [];
      const last = msgs[msgs.length - 1];
      return last && last.senderId !== currentUserId;
    });
  }, [mentees, messagesByMentorship, currentUserId]);

  const items = [
    recentMentees.length > 0 && {
      title: t('mentorship.coach.notifications.newMentees'),
      body: t('mentorship.coach.notifications.studentsAssigned', { count: recentMentees.length }),
    },
    unreadThreads.length > 0 && {
      title: t('mentorship.coach.notifications.newMessages'),
      body: t('mentorship.coach.notifications.conversationsAwaiting', { count: unreadThreads.length }),
    },
    upcomingReminders.length > 0 && {
      title: t('mentorship.coach.notifications.sessionReminders'),
      body: t('mentorship.coach.notifications.sessionsIn24h', { count: upcomingReminders.length }),
    },
  ].filter(Boolean) as { title: string; body: string }[];

  if (items.length === 0) {
    return <Text muted>{t('mentorship.coach.notifications.allCaughtUp')}</Text>;
  }

  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <View key={item.title} style={styles.item}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text muted variant="caption">
            {item.body}
          </Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: { gap: spacing.sm },
  item: {
    padding: spacing.sm,
    backgroundColor: mentorshipColors.surface,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: mentorshipColors.accent,
  },
  itemTitle: { fontWeight: '600', marginBottom: 2 },
});
}
