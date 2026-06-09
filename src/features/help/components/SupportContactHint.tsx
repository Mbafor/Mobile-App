import { useRouter, type Href } from 'expo-router';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { StyleSheet } from 'react-native';

import { Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';

export function SupportContactHint() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();

  return (
    <Text muted variant="caption" style={styles.hint}>
      Facing any challenges? Contact us at{' '}
      <Text
        variant="caption"
        style={styles.link}
        onPress={() => router.push(ROUTES.MAIN.HELP.INDEX as Href)}
      >
        Help & Support
      </Text>
      .
    </Text>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  hint: {
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
}
