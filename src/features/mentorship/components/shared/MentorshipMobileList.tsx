import type { ReactNode } from 'react';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type MentorshipMobileListProps<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  emptyMessage?: string;
};

/** Vertical card list — mobile-first alternative to wide data tables. */
export function MentorshipMobileList<T>({
  data,
  keyExtractor,
  renderCard,
  emptyMessage = 'Nothing here yet.',
}: MentorshipMobileListProps<T>) {
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text muted>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {data.map((item) => (
        <View key={keyExtractor(item)} style={styles.cardWrap}>
          {renderCard(item)}
        </View>
      ))}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  list: { gap: spacing.sm },
  cardWrap: {
    borderRadius: 14,
    backgroundColor: mentorshipColors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
    overflow: 'hidden',
  },
  empty: {
    padding: spacing.lg,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: mentorshipColors.surface,
  },
});
}
