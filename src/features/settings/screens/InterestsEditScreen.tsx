import { useEffect, useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField, MultiSelectWithOther } from '@/components/forms';
import { Button } from '@/components/ui';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { INTEREST_OPTIONS, PREDEFINED_INTERESTS } from '@/constants/onboarding-options';
import { spacing } from '@/constants/theme';

export function InterestsEditScreen() {
  const styles = useThemedStyles(createStyles);
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
      Alert.alert('Required field', 'Select at least one interest.');
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
        <FormField label="Interests *">
          <MultiSelectWithOther
            options={INTEREST_OPTIONS}
            predefinedValues={PREDEFINED_INTERESTS}
            values={interests}
            onChange={setInterests}
            placeholder="Select interests"
          />
        </FormField>

        {error ? <ErrorMessage message={error} /> : null}

        <Button onPress={() => void handleSave()} loading={isLoading} disabled={isLoading}>
          Save
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
