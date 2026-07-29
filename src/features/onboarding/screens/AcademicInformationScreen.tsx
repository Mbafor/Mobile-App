import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const [fieldErrors, setFieldErrors] = useState<{ university?: string; courseMajor?: string; interests?: string }>({});

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
    const nextErrors: { university?: string; courseMajor?: string; interests?: string } = {};
    if (!university.trim()) nextErrors.university = t('onboarding.academic.universityError');
    if (!courseMajor.trim()) nextErrors.courseMajor = t('onboarding.academic.courseError');
    if (interests.length === 0) nextErrors.interests = t('onboarding.academic.interestsError');
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
      <FormField label={t('onboarding.academic.universityLabel')} error={fieldErrors.university}>
        <Input
          value={university}
          onChangeText={(text) => {
            setUniversity(text);
            if (fieldErrors.university) setFieldErrors((prev) => ({ ...prev, university: undefined }));
          }}
          placeholder={t('onboarding.academic.universityPlaceholder')}
          error={Boolean(fieldErrors.university)}
        />
      </FormField>
      <FormField label={t('onboarding.academic.degreeLabel')}>
        <DegreeLevelPicker value={degreeLevel} onChange={setDegreeLevel} />
      </FormField>
      <FormField label={t('onboarding.academic.courseLabel')} error={fieldErrors.courseMajor}>
        <SelectWithOther
          options={getCourseMajorOptions()}
          predefinedValues={PREDEFINED_COURSE_MAJORS}
          value={courseMajor}
          onChange={(value) => {
            setCourseMajor(value);
            if (fieldErrors.courseMajor) setFieldErrors((prev) => ({ ...prev, courseMajor: undefined }));
          }}
          placeholder={t('onboarding.academic.coursePlaceholder')}
          error={Boolean(fieldErrors.courseMajor)}
        />
      </FormField>
      <FormField label={t('onboarding.academic.interestsLabel')} error={fieldErrors.interests}>
        <MultiSelectWithOther
          options={getInterestOptions()}
          predefinedValues={PREDEFINED_INTERESTS}
          values={interests}
          onChange={(next) => {
            setInterests(next);
            if (fieldErrors.interests) setFieldErrors((prev) => ({ ...prev, interests: undefined }));
          }}
          placeholder={t('onboarding.academic.interestsPlaceholder')}
          error={Boolean(fieldErrors.interests)}
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
