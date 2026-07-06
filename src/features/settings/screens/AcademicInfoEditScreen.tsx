import { useEffect, useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField, SelectWithOther } from '@/components/forms';
import { Button, Input } from '@/components/ui';
import { DegreeLevelPicker } from '@/features/onboarding/components/DegreeLevelPicker';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import {
  COURSE_MAJOR_OPTIONS,
  PREDEFINED_COURSE_MAJORS,
} from '@/constants/onboarding-options';
import { spacing } from '@/constants/theme';

export function AcademicInfoEditScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { profile, refetch } = useProfileData();
  const { saveAcademicInfo, isLoading, error, clearError } = useOnboardingActions();

  const [university, setUniversity] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('bachelors');
  const [courseMajor, setCourseMajor] = useState('');

  useEffect(() => {
    if (profile) {
      setUniversity(profile.university ?? '');
      setDegreeLevel(profile.degreeLevel ?? 'bachelors');
      setCourseMajor(profile.courseMajor ?? '');
    }
  }, [profile]);

  const handleSave = async () => {
    clearError();

    if (!university.trim() || !courseMajor.trim()) {
      Alert.alert('Required fields', 'Please enter your university and course/major.');
      return;
    }

    const ok = await saveAcademicInfo({
      university: university.trim(),
      degreeLevel,
      courseMajor: courseMajor.trim(),
      interests: profile?.interests ?? [],
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
        <FormField label="University *">
          <Input value={university} onChangeText={setUniversity} placeholder="Institution" />
        </FormField>
        <FormField label="Degree level *">
          <DegreeLevelPicker value={degreeLevel} onChange={setDegreeLevel} />
        </FormField>
        <FormField label="Course / major *">
          <SelectWithOther
            options={COURSE_MAJOR_OPTIONS}
            predefinedValues={PREDEFINED_COURSE_MAJORS}
            value={courseMajor}
            onChange={setCourseMajor}
            placeholder="Select course or major"
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
