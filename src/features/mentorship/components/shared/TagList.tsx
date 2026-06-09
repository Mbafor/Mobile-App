import { StyleSheet, View } from 'react-native';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type TagListProps = {
  label: string;
  items: string[];
};

export function TagList({ label, items }: TagListProps) {
  const styles = useAppThemedStyles(createStyles);
  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <View style={styles.tags}>
        {items.map((item) => (
          <View key={item} style={styles.tag}>
            <Text variant="caption" style={styles.tagText}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: { gap: spacing.xs },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    backgroundColor: mentorshipColors.accentMuted,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  tagText: { color: mentorshipColors.accentDark, fontWeight: '500' },
});
}
