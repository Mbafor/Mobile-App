import { Pressable, StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Text } from '@/components/ui';
import { NOTIFICATION_TYPE_LABELS } from '@/features/notifications/constants/notification-types';
import { spacing } from '@/constants/theme';
import type { AppNotification } from '@/types/domain/notification';
import { formatRelativeDate } from '@/utils/formatting';

type Props = {
  notification: AppNotification;
  onPress: () => void;
};

export function NotificationListItem({ notification, onPress }: Props) {
  const styles = useThemedStyles(createStyles);
  const isUnread = !notification.readAt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isUnread && styles.unread,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <Text variant="caption">{NOTIFICATION_TYPE_LABELS[notification.type]}</Text>
        <Text muted variant="caption">
          {formatRelativeDate(notification.createdAt)}
        </Text>
      </View>
      <Text style={styles.title}>{notification.title}</Text>
      <Text muted>{notification.body}</Text>
    </Pressable>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  row: {
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  unread: {
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.85 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: { fontWeight: '600', marginBottom: spacing.xs },
});
}
