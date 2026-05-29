import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { NOTIFICATION_FILTER_LABELS } from '@/features/notifications/constants/notification-types';
import { colors, spacing } from '@/constants/theme';
import type { NotificationFilter } from '@/types/domain/notification';

const FILTERS: NotificationFilter[] = [
  'all',
  'unread',
  'mentorship',
  'opportunities',
  'system',
];

type Props = {
  active: NotificationFilter;
  onChange: (filter: NotificationFilter) => void;
  unreadCount: number;
};

export function NotificationFilterBar({ active, onChange, unreadCount }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {FILTERS.map((filter) => {
        const isActive = filter === active;
        const label =
          filter === 'unread' && unreadCount > 0
            ? `${NOTIFICATION_FILTER_LABELS[filter]} (${unreadCount})`
            : NOTIFICATION_FILTER_LABELS[filter];

        return (
          <Pressable
            key={filter}
            onPress={() => onChange(filter)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text
              variant="caption"
              style={[styles.chipText, isActive && styles.chipTextActive]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
      <View style={styles.trailing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '600',
    lineHeight: 18,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 18,
  },
  trailing: { width: spacing.xs },
});
