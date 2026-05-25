import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { spacing } from '@/constants/theme';

type TagListProps = {
  label: string;
  items: string[];
};

export function TagList({ label, items }: TagListProps) {
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

const styles = StyleSheet.create({
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
