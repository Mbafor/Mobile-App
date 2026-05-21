import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

type CVSectionHeaderProps = {
  title: string;
  description?: string;
};

export function CVSectionHeader({ title, description }: CVSectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text muted variant="caption" style={styles.description}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  description: { lineHeight: 18, color: colors.textMuted },
});
