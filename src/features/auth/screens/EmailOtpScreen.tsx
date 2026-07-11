import { useRouter, type Href } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
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
  const { t } = useTranslation();
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
        t('auth.email.forgotEmailFirstTitle'),
        t('auth.email.forgotEmailFirstBody'),
      );
      return;
    }
    Alert.alert(
      t('auth.email.resetTitle'),
      t('auth.email.resetConfirm', { email: target }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.email.sendLink'),
          onPress: async () => {
            const result = await sendPasswordReset(target);
            if (result) {
              Alert.alert(
                t('auth.email.resetSentTitle'),
                t('auth.email.resetSentBody', { email: target }),
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
      Alert.alert(t('auth.email.invalidEmailTitle'), t('auth.email.invalidEmailBody'));
      return;
    }
    if (!isValidPassword(password)) {
      Alert.alert(t('auth.email.shortPasswordTitle'), t('auth.email.shortPasswordBody'));
      return;
    }

    const result = await signInWithEmailPassword(normalized, password);
    if (!result) return;

    if ('accountNotFound' in result) {
      router.replace(
        `/(auth)/welcome?email=${encodeURIComponent(normalized)}&switchToSignup=true` as Href,
      );
      return;
    }

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
      title={t('auth.email.title')}
      subtitle={t('auth.email.subtitle')}
      onBack={() => router.replace(ROUTES.AUTH.WELCOME as Href)}
      backgroundColor={colors.background}

    >
      <FormField label={t('auth.fields.email')}>
        <Input
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder={t('auth.fields.emailPlaceholder')}
        />
      </FormField>

      {/* Password field with eye toggle — border lives on the wrapper View */}
      <FormField label={t('auth.fields.password')}>
        <View style={styles.passwordField}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            placeholder={t('auth.fields.passwordPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.passwordInput}
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={8}
            accessibilityLabel={showPassword ? t('auth.fields.hidePassword') : t('auth.fields.showPassword')}
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
        <Text style={styles.forgotText}>{t('auth.common.forgotPassword')}</Text>
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
          {t('auth.common.continue')}
        </Button>
      </View>

      <Pressable onPress={() => Linking.openURL('mailto:support@voila-africa.com')} style={styles.supportRow}>
        <Text style={styles.supportText}>
          {t('auth.common.supportPrefix')} <Text style={styles.supportEmail}>support@voila-africa.com</Text>
        </Text>
      </Pressable>
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

    supportRow: {
      alignItems: 'center',
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
    },
    supportText: {
      color: colors.textMuted,
      fontSize: typography.fontSize.xs,
      textAlign: 'center',
      lineHeight: 18,
    },
    supportEmail: {
      color: colors.primary,
      fontWeight: '500',
    },
  });
}
