import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField, MultiSelectWithOther } from '@/components/forms';
import { Button } from '@/components/ui';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { getInterestOptions, PREDEFINED_INTERESTS } from '@/constants/onboarding-options';
import { spacing } from '@/constants/theme';

export function InterestsEditScreen() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, refetch } = useProfileData();
  const { saveAcademicInfo, isLoading, error, clearError } = useOnboardingActions();

  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setInterests(profile.interests ?? []);
    }
  }, [profile]);

  const handleSave = async () => {
    clearError();

    if (interests.length === 0) {
      Alert.alert(t('settings.interests.requiredTitle'), t('settings.interests.requiredMessage'));
      return;
    }

    const ok = await saveAcademicInfo({
      university: profile?.university ?? '',
      degreeLevel: profile?.degreeLevel ?? 'bachelors',
      courseMajor: profile?.courseMajor ?? '',
      interests,
      careerInterests: profile?.careerInterests ?? [],
    });

    if (ok) {
      await refetch();
      router.back();
    }
  };

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
        <FormField label={t('settings.interests.label')}>
          <MultiSelectWithOther
            options={getInterestOptions()}
            predefinedValues={PREDEFINED_INTERESTS}
            values={interests}
            onChange={setInterests}
            placeholder={t('settings.interests.placeholder')}
          />
        </FormField>

        {error ? <ErrorMessage message={error} /> : null}

        <Button onPress={() => void handleSave()} loading={isLoading} disabled={isLoading}>
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
    content: {
      padding: spacing.md,
      gap: spacing.md,
      paddingBottom: spacing.xl * 2,
      maxWidth: 1200,
      width: '100%',
      alignSelf: 'center',
    },
  });
}
