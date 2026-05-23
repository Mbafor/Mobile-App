import { Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui';
import { spacing } from '@/constants/theme';

type SocialAuthButtonsProps = {
  onGooglePress: () => void;
  onApplePress: () => void;
  loading?: boolean;
  layout?: 'column' | 'row';
};

export function SocialAuthButtons({
  onGooglePress,
  onApplePress,
  loading = false,
  layout = 'column',
}: SocialAuthButtonsProps) {
  const isRow = layout === 'row';
  const showApple = Platform.OS === 'ios' || Platform.OS === 'android';

  return (
    <View style={[styles.container, isRow && styles.containerRow]}>
      <Button
        variant="secondary"
        onPress={onGooglePress}
        loading={loading}
        disabled={loading}
        style={isRow ? styles.rowButton : undefined}
      >
        Continue with Google
      </Button>
      {showApple ? (
        <Button
          variant="secondary"
          onPress={onApplePress}
          loading={loading}
          disabled={loading}
          style={isRow ? styles.rowButton : undefined}
        >
          Continue with Apple
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  containerRow: { flexDirection: 'row', gap: spacing.sm },
  rowButton: { flex: 1 },
});
