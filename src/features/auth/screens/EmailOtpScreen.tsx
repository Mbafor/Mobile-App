import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField } from '@/components/forms';
import { Button, Input } from '@/components/ui';
import { AuthScreenLayout } from '@/features/auth/components';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { spacing } from '@/constants/theme';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import { isValidEmail } from '@/utils/validation';
import { isValidPassword } from '@/utils/validation/password';

export function EmailOtpScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  useAuthRedirect('guest');
  const { signInWithEmailPassword, isLoading, error, clearError } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleNext = async () => {
    clearError();
    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    if (!isValidPassword(password)) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }

    const result = await signInWithEmailPassword(normalized, password);
    if (!result) return;

    if (result.needsOtp) {
      router.push(
        `/(auth)/verify-otp?email=${encodeURIComponent(normalized)}&otpType=${result.otpType}` as Href,
      );
      return;
    }

    const onboardingComplete = useAuthStore.getState().profile?.onboardingComplete ?? false;
    router.replace(
      (onboardingComplete ? ROUTES.MAIN.DASHBOARD : ROUTES.ONBOARDING.BASIC_INFO) as Href,
    );
  };

  return (
    <AuthScreenLayout
      title="Sign in"
      subtitle="Enter your email and password. We will send a 6-digit code to confirm your email when needed."
      onBack={() => router.replace(ROUTES.AUTH.WELCOME as Href)}
      backgroundColor={colors.background}
      backTextColor={colors.text}
    >
      <FormField label="Email address">
        <Input
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@university.edu"
        />
      </FormField>

      <FormField label="Password">
        <Input
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          placeholder="At least 8 characters"
        />
      </FormField>

      {env.configError ? <ErrorMessage message={env.configError} /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      <View style={styles.actions}>
        <Button
          variant="primary"
          onPress={handleNext}
          loading={isLoading}
          disabled={isLoading}
          style={styles.continueBtn}
          textStyle={styles.continueBtnText}
        >
          Continue
        </Button>
      </View>
    </AuthScreenLayout>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  actions: { marginTop: spacing.md },
  continueBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 48,
  },
  continueBtnText: {
    color: colors.background,
    fontWeight: '500',
  },
});
}
