import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Button, Text } from '@/components/ui';
import { AuthScreenLayout, OtpInput } from '@/features/auth/components';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';

const RESEND_COOLDOWN_SEC = 60;

export function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email =
    typeof params.email === 'string'
      ? decodeURIComponent(params.email).trim().toLowerCase()
      : '';

  const { isAuthenticated, onboardingComplete, isAuthReady, isProfileLoading } = useAuth();
  const { verifyEmailOtp, sendEmailOtp, isLoading, error, clearError } = useAuthActions();
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN_SEC);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!email) router.replace(ROUTES.AUTH.EMAIL as Href);
  }, [email, router]);

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
    const result = await verifyEmailOtp(email, code);
    if (result) setVerified(true);
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    clearError();
    const ok = await sendEmailOtp(email);
    if (ok) {
      setResendIn(RESEND_COOLDOWN_SEC);
      Alert.alert('Code sent', 'A new code has been sent to your email.');
    }
  };

  if (!email) return null;

  const waiting = verified && (!isAuthReady || isProfileLoading);

  return (
    <AuthScreenLayout
      title="Enter your code"
      subtitle={`Code sent to ${email}. Expires in 10 minutes.`}
      onBack={() => router.back()}
    >
      <OtpInput value={code} onChange={setCode} autoFocus />
      {error ? <ErrorMessage message={error} /> : null}
      <View style={styles.actions}>
        <Button onPress={handleVerify} loading={isLoading || waiting} disabled={isLoading || waiting}>
          {waiting ? 'Signing you in…' : 'Verify & continue'}
        </Button>
      </View>
      <Pressable onPress={handleResend} disabled={resendIn > 0 || isLoading} style={styles.resend}>
        <Text style={[styles.resendText, resendIn > 0 && styles.resendMuted]}>
          {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
        </Text>
      </Pressable>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  actions: { marginTop: spacing.lg },
  resend: { marginTop: spacing.lg, alignItems: 'center' },
  resendText: { color: colors.primary, fontWeight: '600' },
  resendMuted: { color: colors.textMuted },
});
