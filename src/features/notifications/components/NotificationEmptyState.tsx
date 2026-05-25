import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import type { NotificationFilter } from '@/types/domain/notification';

const COPY: Record<NotificationFilter, { title: string; subtitle: string }> = {
  all: {
    title: 'All caught up',
    subtitle: 'When you get matches, messages, or deadline reminders, they will show up here.',
  },
  unread: {
    title: 'No unread notifications',
    subtitle: 'You have read everything. Check back later for new updates.',
  },
  mentorship: {
    title: 'No mentorship notifications',
    subtitle: 'Coach assignments, messages, and session updates will appear in this filter.',
  },
  opportunities: {
    title: 'No opportunity notifications',
    subtitle: 'New matches and deadline reminders for saved listings will show here.',
  },
  system: {
    title: 'No announcements',
    subtitle: 'Platform updates and broadcasts from Olives Forum will appear here.',
  },
};

type Props = {
  filter: NotificationFilter;
};

export function NotificationEmptyState({ filter }: Props) {
  const copy = COPY[filter];

  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name="notifications-outline" size={36} color={colors.primary} />
      </View>
      <Text variant="title" style={styles.title}>
        {copy.title}
      </Text>
      <Text muted style={styles.subtitle}>
        {copy.subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F0EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
