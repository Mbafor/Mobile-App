import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { StalledEntry } from '@/features/opportunities/utils/tracker-stalled';
import { spacing } from '@/constants/theme';

type TrackerStalledBannerProps = {
  entry: StalledEntry;
  onPress: () => void;
  onDismiss: () => void;
};

export function TrackerStalledBanner({ entry, onPress, onDismiss }: TrackerStalledBannerProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Pressable style={styles.banner} onPress={onPress} accessibilityRole="button">
      <Ionicons name="notifications-outline" size={16} color={colors.primary} style={styles.icon} />
      <Text style={styles.text}>
        {t('opportunities.tracker.stalledBanner', {
          title: entry.item.opportunity.title,
          stage: t(`opportunities.tracker.stages.${entry.item.stage}`),
          days: entry.daysSinceUpdate,
        })}
      </Text>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        hitSlop={8}
        accessibilityLabel={t('opportunities.tracker.stalledDismiss')}
        style={styles.dismissBtn}
      >
        <Ionicons name="close" size={16} color={colors.textMuted} />
      </Pressable>
    </Pressable>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      padding: spacing.sm + 5,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    icon: { marginTop: 2 },
    text: { flex: 1, fontSize: 12.5, lineHeight: 18, color: colors.text },
    dismissBtn: { padding: 2 },
  });
}
