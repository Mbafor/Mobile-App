import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField, MultiSelectWithOther, SelectWithOther } from '@/components/forms';
import { Input } from '@/components/ui';
import { DegreeLevelPicker, OnboardingShell } from '@/features/onboarding/components';
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
import { formatListInput, parseListInput } from '@/utils/formatting';

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
    <OnboardingShell
      currentStep={ONBOARDING_STEPS.ACADEMIC}
      title="Academic information"
      subtitle="Help us tailor opportunities to your studies and goals."
      onBack={() => router.back()}
      onContinue={() => void handleContinue()}
      isLoading={isLoading}
    >
      <FormField label="University *">
        <Input
          value={university}
          onChangeText={setUniversity}
          placeholder="Your institution"
          leftIcon={<Ionicons name="school-outline" size={16} color="#9CA3AF" />}
        />
      </FormField>
      <View style={academicStyles.row}>
        <View style={academicStyles.col}>
          <FormField label="Degree level *">
            <DegreeLevelPicker value={degreeLevel} onChange={setDegreeLevel} />
          </FormField>
        </View>
        <View style={academicStyles.col}>
          <FormField label="Course / Major *">
            <SelectWithOther
              options={COURSE_MAJOR_OPTIONS}
              predefinedValues={PREDEFINED_COURSE_MAJORS}
              value={courseMajor}
              onChange={setCourseMajor}
              placeholder="Select course / major"
            />
          </FormField>
        </View>
      </View>
      <FormField label="Interests *">
        <MultiSelectWithOther
          options={INTEREST_OPTIONS}
          predefinedValues={PREDEFINED_INTERESTS}
          values={interests}
          onChange={setInterests}
          placeholder="Select interests"
          pillMode
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
    </OnboardingShell>
  );
}

const academicStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
});
