import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export function AuthDivider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text variant="caption" muted>
        or
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
});
