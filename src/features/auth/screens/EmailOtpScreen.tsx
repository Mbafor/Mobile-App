import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ErrorMessage } from '@/components/feedback';
import { FormField } from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
import { AuthScreenLayout } from '@/features/auth/components';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import { spacing, typography } from '@/constants/theme';
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
        'Enter your email first',
        'Type your email address in the field above, then tap "Forgot password?".',
      );
      return;
    }
    Alert.alert(
      'Reset password',
      `Send a reset link to ${target}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send link',
          onPress: async () => {
            const result = await sendPasswordReset(target);
            if (result) {
              Alert.alert(
                'Check your inbox',
                `A password reset link has been sent to ${target}.`,
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

      {/* Password field with eye toggle — border lives on the wrapper View */}
      <FormField label="Password">
        <View style={styles.passwordField}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            placeholder="At least 8 characters"
            placeholderTextColor={colors.textMuted}
            style={styles.passwordInput}
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={8}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
      </FormField>

      {/* Forgot password link — always visible beneath the password field */}
      <Pressable onPress={handleForgotPassword} style={styles.forgotWrap} hitSlop={12}>
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

    // Password field: border on the container, raw TextInput inside
    passwordField: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    passwordInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRightWidth: 0,
      paddingVertical: spacing.md,
      paddingLeft: spacing.md,
      paddingRight: spacing.xs,
      fontSize: typography.fontSize.md,
      color: colors.text,
      backgroundColor: colors.background,
      ...Platform.select({ web: { outlineWidth: 0 } as object }),
    },
    eyeBtn: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      backgroundColor: colors.background,
    },

    // Forgot password — full-width row so it's always easy to tap
    forgotWrap: {
      marginTop: spacing.sm,
      alignSelf: 'flex-end',
    },
    forgotText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '600',
    },
  });
}
