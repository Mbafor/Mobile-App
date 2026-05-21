import { Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui';
import { spacing } from '@/constants/theme';

type SocialAuthButtonsProps = {
  onGooglePress: () => void;
  onApplePress: () => void;
  loading?: boolean;
};

export function SocialAuthButtons({
  onGooglePress,
  onApplePress,
  loading = false,
}: SocialAuthButtonsProps) {
  return (
    <View style={styles.container}>
      <Button variant="secondary" onPress={onGooglePress} loading={loading} disabled={loading}>
        Continue with Google
      </Button>
      {(Platform.OS === 'ios' || Platform.OS === 'android') && (
        <Button variant="secondary" onPress={onApplePress} loading={loading} disabled={loading}>
          Continue with Apple
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
});
