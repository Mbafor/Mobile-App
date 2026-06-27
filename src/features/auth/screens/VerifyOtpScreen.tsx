import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ErrorMessage } from '@/components/feedback';
import { Button, Text } from '@/components/ui';
import { AuthScreenLayout } from '@/features/auth/components';
import { OtpInput } from '@/features/auth/components';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { ROUTES } from '@/constants/routes';
import { spacing, typography } from '@/constants/theme';
import type { OtpVerificationType } from '@/services/api/auth.api';

const RESEND_COOLDOWN_SEC = 60;

function parseOtpType(value: string | string[] | undefined): OtpVerificationType {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'email' ? 'email' : 'signup';
}

export function VerifyOtpScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; otpType?: string; source?: string }>();
  const email =
    typeof params.email === 'string'
      ? decodeURIComponent(params.email).trim().toLowerCase()
      : '';
  const otpType = parseOtpType(params.otpType);
  const backRoute =
    params.source === 'welcome' ? (ROUTES.AUTH.WELCOME as Href) : (ROUTES.AUTH.EMAIL as Href);

  const { isAuthenticated, onboardingComplete, isAuthReady, isProfileLoading } = useAuth();
  const { verifyEmailOtp, resendEmailOtp, isLoading, error, clearError } = useAuthActions();
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_SEC);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!email) router.replace(ROUTES.AUTH.EMAIL as Href);
  }, [email, router]);

  useEffect(() => {
    if (!isAuthReady || verified || isLoading) return;
    if (isAuthenticated && !isProfileLoading) {
      router.replace(
        (onboardingComplete ? ROUTES.MAIN.DASHBOARD : ROUTES.ONBOARDING.BASIC_INFO) as Href,
      );
    }
  }, [
    isAuthReady,
    isAuthenticated,
    isLoading,
    isProfileLoading,
    onboardingComplete,
    router,
    verified,
  ]);

  useEffect(() => {
    if (!verified || !isAuthReady || !isAuthenticated || isProfileLoading) return;
    router.replace(
      (onboardingComplete ? ROUTES.MAIN.DASHBOARD : ROUTES.ONBOARDING.BASIC_INFO) as Href,
    );
  }, [verified, isAuthReady, isAuthenticated, isProfileLoading, onboardingComplete, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const handleVerify = async () => {
    clearError();
    if (code.length !== 6) {
      Alert.alert('Enter code', 'Please enter the 6-digit code from your email.');
      return;
    }
    const result = await verifyEmailOtp(email, code, otpType);
    if (result) setVerified(true);
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    clearError();
    const ok = await resendEmailOtp(email, otpType);
    if (ok) {
      setResendIn(RESEND_COOLDOWN_SEC);
      Alert.alert('Code sent', 'A new code has been sent to your email.');
    }
  };

  if (!email) return null;

  const waiting = verified && (!isAuthReady || !isAuthenticated || isProfileLoading);

  return (
    <AuthScreenLayout
      title="Confirm your email"
      subtitle={`Enter the 6-digit code sent to ${email}`}
      onBack={() => router.replace(backRoute)}
      backgroundColor={colors.background}

    >
      <View style={styles.emailSentBanner}>
        <View style={styles.emailSentIcon}>
          <Ionicons name="mail-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.emailSentTextWrap}>
          <Text style={styles.emailSentTitle}>Check your email</Text>
          <Text style={styles.emailSentSub}>Your verification code has been sent</Text>
        </View>
      </View>

      <Text style={styles.panelSub}>Expires in 10 minutes.</Text>

      <View style={styles.otpWrap}>
        <OtpInput value={code} onChange={setCode} autoFocus onComplete={handleVerify} />
      </View>

      {error ? <ErrorMessage message={error} /> : null}

      <Button
        onPress={handleVerify}
        loading={isLoading || waiting}
        disabled={isLoading || waiting}
        style={styles.verifyBtn}
        textStyle={styles.verifyBtnText}
      >
        {waiting ? 'Signing you in…' : 'Verify & continue'}
      </Button>

      <Pressable onPress={handleResend} disabled={resendIn > 0 || isLoading} style={styles.resend}>
        {resendIn > 0 ? (
          <Text style={styles.resendMuted}>
            Resend code in <Text style={styles.resendTimer}>{resendIn}s</Text>
          </Text>
        ) : (
          <Text style={styles.resendActive}>Resend code</Text>
        )}
      </Pressable>
    </AuthScreenLayout>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  emailSentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.primary}18`,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${colors.primary}35`,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  emailSentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emailSentTextWrap: {
    flex: 1,
    gap: 2,
  },
  emailSentTitle: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: typography.fontSize.md,
  },
  emailSentSub: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
    opacity: 0.8,
  },
  panelSub: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  otpWrap: {
    marginBottom: spacing.sm,
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 50,
  },
  verifyBtnText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: typography.fontSize.md,
  },
  resend: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resendMuted: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  resendTimer: {
    color: colors.text,
    fontWeight: '500',
  },
  resendActive: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
});
}
