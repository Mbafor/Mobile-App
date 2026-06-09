import { StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type CVSectionHeaderProps = {
  title: string;
  description?: string;
};

export function CVSectionHeader({ title, description }: CVSectionHeaderProps) {
  const styles = useThemedStyles(createStyles);
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

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: { gap: spacing.xs },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  description: { lineHeight: 18, color: colors.textMuted },
});
}
