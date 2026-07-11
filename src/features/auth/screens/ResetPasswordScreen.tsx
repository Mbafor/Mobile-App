import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ErrorMessage } from '@/components/feedback';
import { FormField } from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
import { AuthScreenLayout } from '@/features/auth/components';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { supabase } from '@/services/supabase/client';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import type { ColorScheme } from '@/constants/theme/types';
import { ROUTES } from '@/constants/routes';

type ScreenState = 'loading' | 'ready' | 'success' | 'expired';

export function ResetPasswordScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { updatePassword, isLoading, error, clearError } = useAuthActions();

  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const expiredTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On web, Supabase auto-detects the session from the URL (detectSessionInUrl: true).
  // On native, we parse the deep link and exchange the code manually.
  useEffect(() => {
    let mounted = true;

    const markReady = () => {
      if (mounted) {
        if (expiredTimer.current) clearTimeout(expiredTimer.current);
        setScreenState('ready');
      }
    };

    // Listen for PASSWORD_RECOVERY (fires after session is set from reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') markReady();
    });

    // Also check for an existing session in case the event already fired
    // before this component mounted (can happen on web with detectSessionInUrl).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && mounted) markReady();
    });

    // Native: parse deep link URL and exchange the PKCE code
    if (Platform.OS !== 'web') {
      const exchangeCode = async (url: string | null) => {
        if (!url) return;
        try {
          const { params } = QueryParams.getQueryParams(url);
          if (params.code) {
            await supabase.auth.exchangeCodeForSession(params.code as string);
            // PASSWORD_RECOVERY fires after exchange — markReady is called above
          }
        } catch {
          // ignore parse errors
        }
      };

      Linking.getLinkingURL().then((url) => void exchangeCode(url));
      const linkSub = Linking.addEventListener('url', ({ url }) => void exchangeCode(url));

      return () => {
        mounted = false;
        subscription.unsubscribe();
        linkSub.remove();
        if (expiredTimer.current) clearTimeout(expiredTimer.current);
      };
    }

    // Fallback: if no session after 8 s, treat link as expired
    expiredTimer.current = setTimeout(() => {
      if (mounted) setScreenState((s) => (s === 'loading' ? 'expired' : s));
    }, 8000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (expiredTimer.current) clearTimeout(expiredTimer.current);
    };
  }, []);

  const handleSubmit = async () => {
    clearError();
    if (newPassword !== confirmPassword) {
      Alert.alert(t('auth.reset.mismatchTitle'), t('auth.reset.mismatchBody'));
      return;
    }
    const result = await updatePassword(newPassword);
    if (result) setScreenState('success');
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (screenState === 'success') {
    return (
      <AuthScreenLayout
        title={t('auth.reset.successTitle')}
        backgroundColor={colors.background}

      >
        <View style={styles.centerBlock}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
          </View>
          <Text style={styles.successText}>
            {t('auth.reset.successBody')}
          </Text>
          <Button
            variant="primary"
            onPress={() => router.replace(ROUTES.AUTH.WELCOME as Href)}
            style={styles.btn}
            textStyle={styles.btnText}
          >
            {t('auth.reset.signIn')}
          </Button>
        </View>
      </AuthScreenLayout>
    );
  }

  // ── Expired state ────────────────────────────────────────────────────────────
  if (screenState === 'expired') {
    return (
      <AuthScreenLayout
        title={t('auth.reset.expiredTitle')}
        backgroundColor={colors.background}

        onBack={() => router.replace(ROUTES.AUTH.EMAIL as Href)}
      >
        <View style={styles.centerBlock}>
          <View style={styles.expiredIcon}>
            <Ionicons name="time-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={styles.expiredText}>
            {t('auth.reset.expiredBody')}
          </Text>
          <Button
            variant="primary"
            onPress={() => router.replace(ROUTES.AUTH.EMAIL as Href)}
            style={styles.btn}
            textStyle={styles.btnText}
          >
            {t('auth.reset.backToSignIn')}
          </Button>
        </View>
      </AuthScreenLayout>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (screenState === 'loading') {
    return (
      <AuthScreenLayout
        title={t('auth.reset.loadingTitle')}
        backgroundColor={colors.background}

      >
        <View style={styles.centerBlock}>
          <Text muted style={styles.loadingText}>{t('auth.reset.verifying')}</Text>
        </View>
      </AuthScreenLayout>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <AuthScreenLayout
      title={t('auth.reset.formTitle')}
      subtitle={t('auth.reset.formSubtitle')}
      backgroundColor={colors.background}
    >
      <FormField label={t('auth.reset.newPasswordLabel')}>
        <View style={styles.passwordRow}>
          <Input
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNew}
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder={t('auth.fields.passwordPlaceholder')}
            style={styles.passwordInput}
            autoFocus
          />
          <Pressable onPress={() => setShowNew((v) => !v)} style={styles.eyeBtn} hitSlop={8}>
            <Ionicons
              name={showNew ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
      </FormField>

      <FormField label={t('auth.reset.confirmPasswordLabel')}>
        <View style={styles.passwordRow}>
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder={t('auth.reset.confirmPasswordPlaceholder')}
            style={styles.passwordInput}
          />
          <Pressable onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn} hitSlop={8}>
            <Ionicons
              name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
      </FormField>

      {error ? <ErrorMessage message={error} /> : null}

      <View style={styles.actions}>
        <Button
          variant="primary"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.btn}
          textStyle={styles.btnText}
        >
          {t('auth.reset.updatePassword')}
        </Button>
      </View>
    </AuthScreenLayout>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    centerBlock: {
      alignItems: 'center',
      paddingTop: spacing.xl,
      gap: spacing.md,
    },
    loadingText: {
      fontSize: typography.fontSize.md,
      textAlign: 'center',
    },
    successIcon: { marginBottom: spacing.sm },
    successText: {
      fontSize: typography.fontSize.md,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 320,
    },
    expiredIcon: { marginBottom: spacing.sm },
    expiredText: {
      fontSize: typography.fontSize.md,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 320,
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
    actions: { marginTop: spacing.lg },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      height: 48,
      width: '100%',
    },
    btnText: {
      color: colors.textOnPrimary,
      fontWeight: '500',
    },
  });
}
