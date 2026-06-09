import { StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

export function PushPermissionBanner() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Push notifications are off</Text>
      <Text muted variant="caption">
        Enable notifications in your device settings to receive alerts on this device.
      </Text>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  title: { fontWeight: '600' },
  banner: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
});
}
