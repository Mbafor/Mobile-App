import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField, MultiSelectWithOther, SelectWithOther } from '@/components/forms';
import { Screen } from '@/components/layout';
import { Button, Input, Text } from '@/components/ui';
import { DegreeLevelPicker, OnboardingProgress } from '@/features/onboarding/components';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useOnboardingGuard } from '@/features/onboarding/hooks/useOnboardingGuard';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';
import {
  COURSE_MAJOR_OPTIONS,
  INTEREST_OPTIONS,
  PREDEFINED_COURSE_MAJORS,
  PREDEFINED_INTERESTS,
} from '@/constants/onboarding-options';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';
import { formatListInput, parseListInput } from '@/utils/formatting';

const isWeb = Platform.OS === 'web';

export function AcademicInformationScreen() {
  const router = useRouter();
  useOnboardingGuard();

  const draft = useOnboardingStore((s) => s.draft.academic);
  const setAcademic = useOnboardingStore((s) => s.setAcademic);
  const loadFromServer = useOnboardingStore((s) => s.loadFromServer);
  const { profile } = useProfileData();
  const { saveAcademicInfo, isLoading, error, clearError } = useOnboardingActions();

  const [university, setUniversity] = useState(draft.university);
  const [degreeLevel, setDegreeLevel] = useState(draft.degreeLevel);
  const [courseMajor, setCourseMajor] = useState(draft.courseMajor);
  const [interests, setInterests] = useState<string[]>(draft.interests);
  const [careerText, setCareerText] = useState(formatListInput(draft.careerInterests));

  useEffect(() => {
    if (profile) {
      loadFromServer({
        academic: {
          university: profile.university ?? '',
          degreeLevel: profile.degreeLevel ?? 'bachelors',
          courseMajor: profile.courseMajor ?? '',
          interests: profile.interests,
          careerInterests: profile.careerInterests,
        },
      });
      setUniversity(profile.university ?? '');
      setDegreeLevel(profile.degreeLevel ?? 'bachelors');
      setCourseMajor(profile.courseMajor ?? '');
      setInterests(profile.interests);
      setCareerText(formatListInput(profile.careerInterests));
    }
  }, [loadFromServer, profile]);

  const handleContinue = async () => {
    clearError();
    if (!university.trim() || !courseMajor.trim()) {
      Alert.alert('Required fields', 'Please enter your university and course/major.');
      return;
    }
    if (interests.length === 0) {
      Alert.alert('Required fields', 'Please select at least one interest.');
      return;
    }
    const academic = {
      university: university.trim(),
      degreeLevel,
      courseMajor: courseMajor.trim(),
      interests,
      careerInterests: parseListInput(careerText),
    };
    setAcademic(academic);
    const ok = await saveAcademicInfo(academic);
    if (ok) router.push(ROUTES.ONBOARDING.PREFERENCES);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <OnboardingProgress currentStep={ONBOARDING_STEPS.ACADEMIC} />
        <Text variant="title">Academic information</Text>
        <Text muted style={styles.subtitle}>
          Help us tailor opportunities to your studies and goals.
        </Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormField label="University *">
            <Input value={university} onChangeText={setUniversity} placeholder="Your institution" />
          </FormField>
          <FormField label="Degree level *">
            <DegreeLevelPicker value={degreeLevel} onChange={setDegreeLevel} />
          </FormField>
          <FormField label="Course / Major *">
            <SelectWithOther
              options={COURSE_MAJOR_OPTIONS}
              predefinedValues={PREDEFINED_COURSE_MAJORS}
              value={courseMajor}
              onChange={setCourseMajor}
              placeholder="Select course / major"
            />
          </FormField>
          <FormField label="Interests *">
            <MultiSelectWithOther
              options={INTEREST_OPTIONS}
              predefinedValues={PREDEFINED_INTERESTS}
              values={interests}
              onChange={setInterests}
              placeholder="Select interests"
            />
          </FormField>
          <FormField label="Career interests (comma-separated)">
            <Input
              value={careerText}
              onChangeText={setCareerText}
              placeholder="e.g. software engineering, academia"
              multiline
            />
          </FormField>
          {error ? <ErrorMessage message={error} /> : null}
        </ScrollView>

        <View style={[styles.footer, isWeb && styles.footerWeb]}>
          <Button
            variant="secondary"
            onPress={() => router.back()}
            style={isWeb ? styles.backBtn : styles.mobileBtn}
          >
            Back
          </Button>
          <Button
            onPress={handleContinue}
            loading={isLoading}
            disabled={isLoading}
            style={isWeb ? styles.ctaBtn : styles.mobileBtn}
          >
            Continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingTop: spacing.lg },
  subtitle: { marginBottom: spacing.md },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.md },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerWeb: { justifyContent: 'flex-end' },
  mobileBtn: { flex: 1 },
  backBtn: { minWidth: 120 },
  ctaBtn: { minWidth: 160 },
});
