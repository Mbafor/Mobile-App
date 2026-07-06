import { StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

export function PrivacySection() {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <Text style={styles.body}>
        We protect your profile, preferences, and activity, and never share them without your
        consent.
      </Text>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: { gap: spacing.sm },
  body: { lineHeight: 22, color: colors.text },
});
}
