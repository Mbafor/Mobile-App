import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/theme';
import type { WaitingListStatus } from '@/types/domain/mentorship';

type WaitingListCardProps = {
  status: WaitingListStatus;
  onCancel?: () => void;
  isCancelling?: boolean;
};

export function WaitingListCard({ status, onCancel, isCancelling }: WaitingListCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Waiting list</Text>
      </View>
      <Text variant="title" style={styles.position}>
        Queue position #{status.position}
      </Text>
      <Text muted>
        {status.totalInQueue} students in queue · joined{' '}
        {new Date(status.enteredAt).toLocaleDateString()}
      </Text>
      <Text style={styles.estimate}>{status.estimatedWaitLabel}</Text>
      {onCancel ? (
        <Button variant="secondary" onPress={onCancel} loading={isCancelling} style={styles.btn}>
          Leave waiting list
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: '#B45309', fontWeight: '600', fontSize: 12 },
  position: { fontSize: 20 },
  estimate: { color: colors.primary, fontWeight: '500' },
  btn: { marginTop: spacing.xs },
});
