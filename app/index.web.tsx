import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { colors } from '@/constants/theme';

const LANDING_URL = process.env.EXPO_PUBLIC_LANDING_URL ?? 'http://localhost:3000';

/**
 * Web root entry point.
 *
 * Mobile uses app/index.tsx (splash → auth bootstrap).
 * Web flow: Next.js landing page → /welcome (auth) → onboarding → dashboard.
 *
 * - Unauthenticated: redirect to the Next.js marketing site.
 * - Authenticated, onboarding incomplete: go to onboarding.
 * - Authenticated, onboarding complete: go to dashboard.
 */
export default function WebRoot() {
  const router = useRouter();
  const { isAuthReady, isAuthenticated, onboardingComplete } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;

    if (!isAuthenticated) {
      window.location.replace(LANDING_URL);
    } else if (!onboardingComplete) {
      router.replace(ROUTES.ONBOARDING.BASIC_INFO as never);
    } else {
      router.replace(ROUTES.MAIN.DASHBOARD as never);
    }
  }, [isAuthReady, isAuthenticated, onboardingComplete, router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
