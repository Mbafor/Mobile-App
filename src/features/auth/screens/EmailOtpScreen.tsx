import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';

import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { env } from '@/config/env';
import { Alert, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField } from '@/components/forms';
import { Button, Input } from '@/components/ui';
import { AuthScreenLayout } from '@/features/auth/components';
import { colors, spacing } from '@/constants/theme';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { ROUTES } from '@/constants/routes';
import { isValidEmail } from '@/utils/validation';

export function EmailOtpScreen() {
  const router = useRouter();
  useAuthRedirect('guest');
  const { sendEmailOtp, isLoading, error, clearError } = useAuthActions();
  const [email, setEmail] = useState('');

  const handleNext = async () => {
    clearError();
    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }

    const ok = await sendEmailOtp(normalized);
    if (ok) {
      router.push(`/(auth)/verify-otp?email=${encodeURIComponent(normalized)}` as Href);
    }
  };

  return (
    <AuthScreenLayout
      title="Your email"
      subtitle="We'll send a 6-digit code Enter it on the next screen to continue."
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
          Next
        </Button>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
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
