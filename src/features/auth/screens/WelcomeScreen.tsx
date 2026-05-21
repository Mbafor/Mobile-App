import { useRouter, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { AuthDivider, SocialAuthButtons } from '@/features/auth/components';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { ROUTES } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';

export function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, signInWithApple, isLoading } = useAuthActions();
  useAuthRedirect('guest');

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>O</Text>
        </View>
        <Text style={styles.title}>Olives Forum</Text>
        <Text style={styles.tagline}>
          Discover opportunities matched to your studies and interests.
        </Text>
      </View>

      <View style={styles.panel}>
        <SocialAuthButtons
          onGooglePress={() => signInWithGoogle()}
          onApplePress={() => signInWithApple()}
          loading={isLoading}
        />
        <AuthDivider />
        <Button onPress={() => router.push(ROUTES.AUTH.EMAIL as Href)} disabled={isLoading}>
          Continue with email
        </Button>
        <Text muted variant="caption" style={styles.hint}>
          Supabase sends a 6-digit code to your email (valid 10 minutes). No password needed.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: { color: colors.background, fontSize: 36, fontWeight: '700' },
  title: {
    color: colors.background,
    fontSize: typography.fontSize.xl + 6,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  tagline: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  panel: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  hint: { textAlign: 'center', marginTop: spacing.xs, lineHeight: 18 },
});
