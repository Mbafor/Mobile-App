import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

export function PushPermissionBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Push notifications are off</Text>
      <Text muted variant="caption">
        Enable notifications in your device settings to receive alerts on this device.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '600' },
  banner: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
});
