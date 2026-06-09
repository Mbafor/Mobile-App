import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Image, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { spacing } from '@/constants/theme';
import type { NotificationAvatarSource } from '@/features/notifications/utils/notification-avatar';

const SIZE = 48;

type Props = {
  source: NotificationAvatarSource;
};

function initial(displayName: string | null): string {
  const trimmed = displayName?.trim();
  if (!trimmed) return 'O';
  return trimmed.charAt(0).toUpperCase();
}

export function NotificationAvatar({ source }: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  if (source.kind === 'user') {
    return (
      <UserAvatarDisplay
        displayName={source.displayName}
        avatarUrl={source.imageUrl}
        size={SIZE}
      />
    );
  }

  if (source.kind === 'opportunity' && source.imageUrl) {
    return (
      <Image
        source={{ uri: source.imageUrl }}
        style={styles.opportunityImage}
        accessibilityIgnoresInvertColors
      />
    );
  }

  if (source.kind === 'opportunity') {
    return (
      <View style={[styles.fallback, styles.opportunityFallback]}>
        <Ionicons name="briefcase-outline" size={22} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.fallback, styles.systemFallback]}>
      <Text style={styles.systemInitial}>{initial(source.displayName)}</Text>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  opportunityImage: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.surface,
  },
  fallback: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opportunityFallback: {
    backgroundColor: '#E8F0EB',
  },
  systemFallback: {
    backgroundColor: colors.primary,
  },
  systemInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
}
