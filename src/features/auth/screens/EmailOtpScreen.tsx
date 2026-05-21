import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField } from '@/components/forms';
import { Button, Input } from '@/components/ui';
import { AuthDivider, AuthScreenLayout, SocialAuthButtons } from '@/features/auth/components';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { isValidEmail } from '@/utils/validation';

export function EmailOtpScreen() {
  const router = useRouter();
  const { sendEmailOtp, signInWithGoogle, signInWithApple, isLoading, error, clearError } =
    useAuthActions();
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
      subtitle="We'll send a 6-digit code via Supabase. Enter it on the next screen to continue."
      onBack={() => router.replace(ROUTES.AUTH.WELCOME as Href)}
    >
      <SocialAuthButtons
        onGooglePress={() => signInWithGoogle()}
        onApplePress={() => signInWithApple()}
        loading={isLoading}
      />
      <AuthDivider />
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
      {error ? <ErrorMessage message={error} /> : null}
      <View style={styles.actions}>
        <Button onPress={handleNext} loading={isLoading} disabled={isLoading}>
          Next
        </Button>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  actions: { marginTop: spacing.md },
});
