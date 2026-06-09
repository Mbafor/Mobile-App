import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
const COPY = {
  title: 'All caught up',
  subtitle: 'When you get matches, messages, or deadline reminders, they will show up here.',
};

export function NotificationEmptyState() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name="notifications-outline" size={36} color={colors.primary} />
      </View>
      <Text variant="title" style={styles.title}>
        {COPY.title}
      </Text>
      <Text muted style={styles.subtitle}>
        {COPY.subtitle}
      </Text>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
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
}
