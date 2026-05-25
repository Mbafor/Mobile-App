import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { MentorshipMobileList } from '@/features/mentorship/components/shared/MentorshipMobileList';
import { SessionManageCard } from '@/features/mentorship/components/shared/SessionManageCard';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import type { MentorshipSession } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type CoachSessionsTableProps = {
  sessions: MentorshipSession[];
  title?: string;
  onConfirm?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  onSetMeetingUrl?: (sessionId: string, url: string) => Promise<void>;
};

export function CoachSessionsTable({
  sessions,
  title,
  onConfirm,
  onCancel,
  onSetMeetingUrl,
}: CoachSessionsTableProps) {
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.heading}>{title}</Text> : null}
      <MentorshipMobileList
        data={sessions}
        keyExtractor={(s) => s.id}
        emptyMessage="No sessions in this category."
        renderCard={(session) => (
          <SessionManageCard
            session={session}
            role="coach"
            onConfirm={onConfirm}
            onCancel={onCancel}
            onSetMeetingUrl={onSetMeetingUrl}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.md },
  heading: { fontSize: 16, fontWeight: '600', color: mentorshipColors.text },
});
