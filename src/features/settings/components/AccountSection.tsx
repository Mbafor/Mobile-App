import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function AccountSection() {
  const router = useRouter();
  const { userEmail, isAdmin } = useAuth();

  return (
    <View style={styles.wrap}>
      {userEmail ? (
        <View style={styles.emailCard}>
          <Text variant="caption" muted>
            Signed in as
          </Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>
      ) : null}

      {isAdmin ? (
        <Button
          variant="secondary"
          onPress={() => router.push(ROUTES.ADMIN.HOME as Href)}
        >
          Open admin dashboard
        </Button>
      ) : (
        <Text muted style={styles.hint}>
          Your account is secured with email sign-in. Use Help & FAQ if you need support.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  emailCard: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  email: { fontWeight: '600', color: colors.text },
  hint: { lineHeight: 20 },
});
