import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { NotificationAvatar } from '@/features/notifications/components/NotificationAvatar';
import { NOTIFICATION_TYPE_LABELS } from '@/features/notifications/constants/notification-types';
import { resolveAvatarSource } from '@/features/notifications/utils/notification-avatar';
import type { NotificationEnrichment } from '@/features/notifications/hooks/useNotificationEnrichment';
import { colors, spacing } from '@/constants/theme';
import type { AppNotification } from '@/types/domain/notification';
import { formatRelativeDate } from '@/utils/formatting';

type Props = {
  notification: AppNotification;
  enrichment: NotificationEnrichment | undefined;
  onPress: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
};

export function SwipeableNotificationRow({
  notification,
  enrichment,
  onPress,
  onMarkRead,
  onDelete,
}: Props) {
  const isUnread = !notification.readAt;
  const avatarSource = resolveAvatarSource(notification, {
    opportunityImages: enrichment?.opportunityImages ?? new Map(),
    profileAvatars: enrichment?.profileAvatars ?? new Map(),
  });

  const renderRightActions = useCallback(
    () => (
      <View style={styles.actions}>
        {isUnread ? (
          <RectButton style={[styles.actionBtn, styles.readBtn]} onPress={onMarkRead}>
            <Ionicons name="checkmark-done-outline" size={22} color="#FFFFFF" />
            <Text style={styles.actionLabel}>Read</Text>
          </RectButton>
        ) : null}
        <RectButton style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
          <Text style={styles.actionLabel}>Delete</Text>
        </RectButton>
      </View>
    ),
    [isUnread, onDelete, onMarkRead],
  );

  return (
    <Animated.View entering={FadeIn.duration(220)} layout={Layout.springify()}>
      <Swipeable
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.row,
            isUnread && styles.unread,
            pressed && styles.pressed,
          ]}
        >
          <NotificationAvatar source={avatarSource} />
          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text variant="caption" style={styles.typeLabel}>
                {NOTIFICATION_TYPE_LABELS[notification.type]}
              </Text>
              <Text muted variant="caption">
                {formatRelativeDate(notification.createdAt)}
              </Text>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {notification.title}
              </Text>
              {isUnread ? <View style={styles.unreadDot} /> : null}
            </View>
            <Text muted numberOfLines={2} style={styles.bodyText}>
              {notification.body}
            </Text>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  unread: {
    backgroundColor: '#F8FBF9',
  },
  pressed: { opacity: 0.88 },
  body: { flex: 1, minWidth: 0 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  typeLabel: {
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontWeight: '600',
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  bodyText: { lineHeight: 20, fontSize: 14 },
  actions: {
    flexDirection: 'row',
    marginBottom: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    width: 76,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  readBtn: { backgroundColor: colors.success },
  deleteBtn: { backgroundColor: colors.error },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
