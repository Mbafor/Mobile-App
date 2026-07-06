import { useState } from 'react';
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
      Alert.alert('Required fields', 'Please fill in all password fields.');
      return;
    }
    if (!isValidPassword(newPassword)) {
      Alert.alert('Weak password', 'New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'New password and confirmation must match.');
      return;
    }

    setIsSaving(true);

    const { error: reauthError } = await authApi.signInWithPassword(userEmail, currentPassword);
    if (reauthError) {
      setIsSaving(false);
      setError('Current password is incorrect.');
      return;
    }

    const ok = await updatePassword(newPassword);
    setIsSaving(false);

    if (ok) {
      Alert.alert('Password updated', 'Your password was changed successfully.');
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PageHeader title="Change Password" onBack={() => router.back()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {userEmail ? <Text muted style={styles.email}>{userEmail}</Text> : null}

        <FormField label="Current password *">
          <Input
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
            autoCapitalize="none"
          />
        </FormField>
        <FormField label="New password *">
          <Input
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
          />
        </FormField>
        <FormField label="Confirm new password *">
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            secureTextEntry
            autoCapitalize="none"
          />
        </FormField>

        {error ? <ErrorMessage message={error} /> : null}

        <Button onPress={() => void handleSave()} loading={isSaving} disabled={isSaving}>
          Save
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
