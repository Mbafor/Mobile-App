import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField } from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { authApi } from '@/services/api';
import { spacing } from '@/constants/theme';
import { isValidPassword } from '@/utils/validation';

export function ChangePasswordScreen() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const { userEmail } = useAuth();
  const { updatePassword } = useAuthActions();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('settings.changePassword.requiredTitle'), t('settings.changePassword.requiredMessage'));
      return;
    }
    if (!isValidPassword(newPassword)) {
      Alert.alert(t('settings.changePassword.weakTitle'), t('settings.changePassword.weakMessage'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('settings.changePassword.mismatchTitle'), t('settings.changePassword.mismatchMessage'));
      return;
    }

    setIsSaving(true);

    const { error: reauthError } = await authApi.signInWithPassword(userEmail, currentPassword);
    if (reauthError) {
      setIsSaving(false);
      setError(t('settings.changePassword.incorrectCurrent'));
      return;
    }

    const ok = await updatePassword(newPassword);
    setIsSaving(false);

    if (ok) {
      Alert.alert(t('settings.changePassword.updatedTitle'), t('settings.changePassword.updatedMessage'));
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PageHeader title={t('settings.changePassword.title')} onBack={() => router.back()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {userEmail ? <Text muted style={styles.email}>{userEmail}</Text> : null}

        <FormField label={t('settings.changePassword.currentLabel')}>
          <Input
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder={t('settings.changePassword.currentPlaceholder')}
            secureTextEntry
            autoCapitalize="none"
          />
        </FormField>
        <FormField label={t('settings.changePassword.newLabel')}>
          <Input
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t('settings.changePassword.newPlaceholder')}
            secureTextEntry
            autoCapitalize="none"
          />
        </FormField>
        <FormField label={t('settings.changePassword.confirmLabel')}>
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('settings.changePassword.confirmPlaceholder')}
            secureTextEntry
            autoCapitalize="none"
          />
        </FormField>

        {error ? <ErrorMessage message={error} /> : null}

        <Button onPress={() => void handleSave()} loading={isSaving} disabled={isSaving}>
          {t('common.save')}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: {
      padding: spacing.md,
      gap: spacing.md,
      paddingBottom: spacing.xl * 2,
      maxWidth: 1200,
      width: '100%',
      alignSelf: 'center',
    },
    email: { marginBottom: spacing.xs },
  });
}
