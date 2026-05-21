import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { colors, spacing } from '@/constants/theme';

export function SplashScreen() {
  const { isAuthReady } = useAuth();
  useAuthRedirect('bootstrap');

  return (
    <View style={styles.container}>
      <Text variant="title" style={styles.brand}>
        Olives Forum
      </Text>
      {!isAuthReady ? (
        <>
          <ActivityIndicator color={colors.background} style={styles.spinner} />
          <Text style={styles.caption}>Loading your session…</Text>
        </>
      ) : (
        <Text style={styles.caption}>Redirecting…</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    gap: spacing.md,
    padding: spacing.lg,
  },
  brand: { color: colors.background, fontSize: 32 },
  spinner: { marginTop: spacing.md },
  caption: { color: colors.background },
});
