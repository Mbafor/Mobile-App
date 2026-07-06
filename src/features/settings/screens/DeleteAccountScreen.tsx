import { useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ErrorMessage } from '@/components/feedback';
import { FormField } from '@/components/forms';
import { Button, Input, Text } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { clearSupabaseAuthStorage } from '@/features/auth/utils/clear-auth-storage';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import { authApi } from '@/services/api';
import { queryClient } from '@/store/query-client';
import { spacing } from '@/constants/theme';

const CONFIRM_WORD = 'DELETE';

export function DeleteAccountScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { userEmail } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = password.length > 0 && confirmText.trim().toUpperCase() === CONFIRM_WORD;

  const handleDelete = async () => {
    setError(null);

    if (!canDelete) {
      Alert.alert(
        'Confirm deletion',
        `Enter your password and type ${CONFIRM_WORD} to confirm.`,
      );
      return;
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      Alert.alert(
        'Delete account',
        'This permanently deletes your account and all data. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
        ],
      );
    });
    if (!confirmed) return;

    setIsDeleting(true);

    const { error: reauthError } = await authApi.signInWithPassword(userEmail, password);
    if (reauthError) {
      setIsDeleting(false);
      setError('Incorrect password.');
      return;
    }

    const { error: deleteError } = await authApi.deleteAccount();
    if (deleteError) {
      setIsDeleting(false);
      setError(deleteError.message);
      return;
    }

    queryClient.clear();
    await authApi.signOut();
    await clearSupabaseAuthStorage();
    useAuthStore.getState().reset();

    if (Platform.OS === 'web') {
      window.location.href = env.LANDING_URL;
    } else {
      router.replace(ROUTES.AUTH.WELCOME);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PageHeader title="Delete Account" onBack={() => router.back()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={22} color={colors.error} />
          <Text style={styles.warningText}>
            Deleting your account permanently removes your profile, preferences, mentorship
            history, saved opportunities, and CVs. This cannot be undone.
          </Text>
        </View>

        <FormField label="Password *">
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
          />
        </FormField>

        <FormField label={`Type ${CONFIRM_WORD} to confirm *`}>
          <Input
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder={CONFIRM_WORD}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </FormField>

        {error ? <ErrorMessage message={error} /> : null}

        <Button
          onPress={() => void handleDelete()}
          loading={isDeleting}
          disabled={isDeleting || !canDelete}
        >
          Delete my account
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
    warningBox: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.error,
      backgroundColor: `${colors.error}0c`,
    },
    warningText: { flex: 1, lineHeight: 20, color: colors.text },
  });
}
