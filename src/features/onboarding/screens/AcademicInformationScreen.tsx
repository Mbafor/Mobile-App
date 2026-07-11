import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField, MultiSelectWithOther, SelectWithOther } from '@/components/forms';
import { Input } from '@/components/ui';
import { DegreeLevelPicker, OnboardingShell } from '@/features/onboarding/components';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useOnboardingGuard } from '@/features/onboarding/hooks/useOnboardingGuard';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';
import {
  getCourseMajorOptions,
  getInterestOptions,
  PREDEFINED_COURSE_MAJORS,
  PREDEFINED_INTERESTS,
} from '@/constants/onboarding-options';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import { ROUTES } from '@/constants/routes';
import { formatListInput, parseListInput } from '@/utils/formatting';

export function AcademicInformationScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
      Alert.alert(t('onboarding.academic.requiredTitle'), t('onboarding.academic.requiredMessageFields'));
      return;
    }
    if (interests.length === 0) {
      Alert.alert(t('onboarding.academic.requiredTitle'), t('onboarding.academic.requiredMessageInterest'));
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
      title={t('onboarding.academic.title')}
      subtitle={t('onboarding.academic.subtitle')}
      onBack={() => router.back()}
      onContinue={() => void handleContinue()}
      isLoading={isLoading}
    >
      <FormField label={t('onboarding.academic.universityLabel')}>
        <Input value={university} onChangeText={setUniversity} placeholder={t('onboarding.academic.universityPlaceholder')} />
      </FormField>
      <FormField label={t('onboarding.academic.degreeLabel')}>
        <DegreeLevelPicker value={degreeLevel} onChange={setDegreeLevel} />
      </FormField>
      <FormField label={t('onboarding.academic.courseLabel')}>
        <SelectWithOther
          options={getCourseMajorOptions()}
          predefinedValues={PREDEFINED_COURSE_MAJORS}
          value={courseMajor}
          onChange={setCourseMajor}
          placeholder={t('onboarding.academic.coursePlaceholder')}
        />
      </FormField>
      <FormField label={t('onboarding.academic.interestsLabel')}>
        <MultiSelectWithOther
          options={getInterestOptions()}
          predefinedValues={PREDEFINED_INTERESTS}
          values={interests}
          onChange={setInterests}
          placeholder={t('onboarding.academic.interestsPlaceholder')}
        />
      </FormField>
      <FormField label={t('onboarding.academic.careerLabel')}>
        <Input
          value={careerText}
          onChangeText={setCareerText}
          placeholder={t('onboarding.academic.careerPlaceholder')}
          multiline
        />
      </FormField>
      {error ? <ErrorMessage message={error} /> : null}
    </OnboardingShell>
  );
}
