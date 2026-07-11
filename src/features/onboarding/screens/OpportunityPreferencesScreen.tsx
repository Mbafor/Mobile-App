import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { FormField, MultiSelectWithOther } from '@/components/forms';
import { Input } from '@/components/ui';
import { FundingPicker, OnboardingShell } from '@/features/onboarding/components';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useOnboardingGuard } from '@/features/onboarding/hooks/useOnboardingGuard';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';
import {
  getOpportunityTypeOptions,
  PREDEFINED_OPPORTUNITY_TYPES,
} from '@/constants/onboarding-options';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import { ROUTES } from '@/constants/routes';
import { formatListInput, parseListInput } from '@/utils/formatting';
import { hasCompletedAcademicInfo, hasCompletedBasicInfo } from '@/utils/profile/onboarding-status';
import type { FundingPreference } from '@/types/domain/user-preferences';

export function OpportunityPreferencesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  useOnboardingGuard();

  const draft = useOnboardingStore((s) => s.draft.preferences);
  const setPreferences = useOnboardingStore((s) => s.setPreferences);
  const loadFromServer = useOnboardingStore((s) => s.loadFromServer);
  const { profile, preferences, isLoading: loadingProfile } = useProfileData();
  const { completeOnboarding, isLoading, error, clearError } = useOnboardingActions();

  const [opportunityTypes, setOpportunityTypes] = useState<string[]>(draft.opportunityTypes);
  const [countriesText, setCountriesText] = useState(formatListInput(draft.preferredCountries));
  const [funding, setFunding] = useState<FundingPreference>(draft.fundingPreference);

  useEffect(() => {
    if (preferences) {
      loadFromServer({
        preferences: {
          opportunityTypes: preferences.opportunityTypes,
          preferredCountries: preferences.preferredCountries,
          fundingPreference: preferences.fundingPreference ?? 'any',
        },
      });
      setOpportunityTypes(preferences.opportunityTypes);
      setCountriesText(formatListInput(preferences.preferredCountries));
      setFunding(preferences.fundingPreference ?? 'any');
    }
  }, [loadFromServer, preferences]);

  const handleFinish = async () => {
    clearError();
    if (!hasCompletedBasicInfo(profile)) {
      Alert.alert(t('onboarding.preferences.incompleteTitle'), t('onboarding.preferences.incompleteBasic'), [
        { text: t('onboarding.preferences.gotoStep1'), onPress: () => router.replace(ROUTES.ONBOARDING.BASIC_INFO) },
      ]);
      return;
    }
    if (!hasCompletedAcademicInfo(profile)) {
      Alert.alert(t('onboarding.preferences.incompleteTitle'), t('onboarding.preferences.incompleteAcademic'), [
        { text: t('onboarding.preferences.gotoStep2'), onPress: () => router.replace(ROUTES.ONBOARDING.ACADEMIC) },
      ]);
      return;
    }
    if (opportunityTypes.length === 0) {
      Alert.alert(t('onboarding.preferences.requiredTitle'), t('onboarding.preferences.requiredTypes'));
      return;
    }
    const preferredCountries = parseListInput(countriesText);
    if (preferredCountries.length === 0) {
      Alert.alert(t('onboarding.preferences.requiredTitle'), t('onboarding.preferences.requiredCountries'));
      return;
    }
    const prefs = { opportunityTypes, preferredCountries, fundingPreference: funding };
    setPreferences(prefs);
    const ok = await completeOnboarding(prefs);
    if (ok) router.replace(ROUTES.MAIN.DASHBOARD);
  };

  return (
    <OnboardingShell
      currentStep={ONBOARDING_STEPS.PREFERENCES}
      title={t('onboarding.preferences.title')}
      subtitle={t('onboarding.preferences.subtitle')}
      onBack={() => router.back()}
      onContinue={() => void handleFinish()}
      continueLabel={t('onboarding.preferences.finish')}
      isLoading={isLoading || loadingProfile}
    >
      <FormField label={t('onboarding.preferences.typesLabel')}>
        <MultiSelectWithOther
          options={getOpportunityTypeOptions()}
          predefinedValues={PREDEFINED_OPPORTUNITY_TYPES}
          values={opportunityTypes}
          onChange={setOpportunityTypes}
          placeholder={t('onboarding.preferences.typesPlaceholder')}
        />
      </FormField>
      <FormField label={t('onboarding.preferences.countriesLabel')}>
        <Input
          value={countriesText}
          onChangeText={setCountriesText}
          placeholder={t('onboarding.preferences.countriesPlaceholder')}
          multiline
        />
      </FormField>
      <FormField label={t('onboarding.preferences.fundingLabel')}>
        <FundingPicker value={funding} onChange={setFunding} />
      </FormField>
      {error ? <ErrorMessage message={error} /> : null}
    </OnboardingShell>
  );
}
