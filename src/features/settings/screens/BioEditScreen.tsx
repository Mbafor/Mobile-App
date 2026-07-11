import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField } from '@/components/forms';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { mentorshipDataApi, profilesApi } from '@/services/api';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export function BioEditScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();
  const { profile, refetch } = useProfileData();

  const mentorQuery = useQuery({
    queryKey: ['mentorship', 'myMentorProfile', userId],
    queryFn: async () => {
      const result = await mentorshipDataApi.getMentorProfile(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(userId),
  });

  const isMentor = Boolean(mentorQuery.data);

  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mentorQuery.isLoading) return;
    setBio((isMentor ? mentorQuery.data?.bio : profile?.bio) ?? '');
  }, [isMentor, mentorQuery.data?.bio, mentorQuery.isLoading, profile?.bio]);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    if (isMentor) {
      const result = await mentorshipDataApi.updateMentorBio(userId, bio);
      setIsSaving(false);
      if (!result.success) {
        setError(result.error.message);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ['mentorship'] });
    } else {
      const { error: saveError } = await profilesApi.saveBio(userId, bio);
      setIsSaving(false);
      if (saveError) {
        setError(saveError.message);
        return;
      }
      await refetch();
    }
    router.back();
  };

  if (mentorQuery.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormField label={t('settings.bio.label')}>
          <Input
            value={bio}
            onChangeText={setBio}
            placeholder={t('settings.bio.placeholder')}
            multiline
            style={styles.bioInput}
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
    flex: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    content: {
      padding: spacing.md,
      gap: spacing.md,
      paddingBottom: spacing.xl * 2,
      maxWidth: 1200,
      width: '100%',
      alignSelf: 'center',
    },
    bioInput: { minHeight: 140, textAlignVertical: 'top' },
  });
}
