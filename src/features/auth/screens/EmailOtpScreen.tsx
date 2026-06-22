import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ErrorMessage } from '@/components/feedback';
import { FormField } from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
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
  const { signInWithEmailPassword, sendPasswordReset, isLoading, error, clearError } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotPassword = async () => {
    const target = email.trim().toLowerCase();
    if (!target || !isValidEmail(target)) {
      Alert.alert(
        'Enter your email',
        'Please type your email address in the field above, then tap "Forgot password?".',
      );
      return;
    }
    Alert.alert(
      'Reset Password',
      `Send a password reset link to ${target}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            const result = await sendPasswordReset(target);
            if (result) {
              Alert.alert(
                'Email sent',
                `A password reset link has been sent to ${target}. Check your inbox.`,
              );
            }
          },
        },
      ],
    );
  };

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
        <View style={styles.passwordRow}>
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            placeholder="At least 8 characters"
            style={styles.passwordInput}
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={8}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
      </FormField>

      <Pressable onPress={handleForgotPassword} style={styles.forgotRow}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </Pressable>

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
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    passwordInput: {
      flex: 1,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRightWidth: 0,
    },
    eyeBtn: {
      height: 48,
      paddingHorizontal: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      backgroundColor: colors.background,
    },
    forgotRow: {
      alignSelf: 'flex-end',
      marginTop: spacing.xs,
    },
    forgotText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '500',
    },
  });
}
