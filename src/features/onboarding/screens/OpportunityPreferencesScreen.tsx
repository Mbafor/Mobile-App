import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
  OPPORTUNITY_TYPE_OPTIONS,
  PREDEFINED_OPPORTUNITY_TYPES,
} from '@/constants/onboarding-options';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import { ROUTES } from '@/constants/routes';
import { formatListInput, parseListInput } from '@/utils/formatting';
import { hasCompletedAcademicInfo, hasCompletedBasicInfo } from '@/utils/profile/onboarding-status';
import type { FundingPreference } from '@/types/domain/user-preferences';

export function OpportunityPreferencesScreen() {
  const router = useRouter();
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
      Alert.alert('Complete earlier steps', 'Please fill in your basic information first.', [
        { text: 'Go to step 1', onPress: () => router.replace(ROUTES.ONBOARDING.BASIC_INFO) },
      ]);
      return;
    }
    if (!hasCompletedAcademicInfo(profile)) {
      Alert.alert('Complete earlier steps', 'Please fill in your academic information first.', [
        { text: 'Go to step 2', onPress: () => router.replace(ROUTES.ONBOARDING.ACADEMIC) },
      ]);
      return;
    }
    if (opportunityTypes.length === 0) {
      Alert.alert('Required fields', 'Please select at least one opportunity type.');
      return;
    }
    const preferredCountries = parseListInput(countriesText);
    if (preferredCountries.length === 0) {
      Alert.alert('Required fields', 'Add at least one preferred country (comma-separated).');
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
      title="Opportunity preferences"
      subtitle="We'll use this to personalise your recommendations."
      onBack={() => router.back()}
      onContinue={() => void handleFinish()}
      continueLabel="Finish setup"
      isLoading={isLoading || loadingProfile}
    >
      <FormField label="Opportunity types *">
        <MultiSelectWithOther
          options={OPPORTUNITY_TYPE_OPTIONS}
          predefinedValues={PREDEFINED_OPPORTUNITY_TYPES}
          values={opportunityTypes}
          onChange={setOpportunityTypes}
          placeholder="Select opportunity types"
        />
      </FormField>
      <FormField label="Preferred countries (comma-separated) *">
        <Input
          value={countriesText}
          onChangeText={setCountriesText}
          placeholder="e.g. UK, Germany, Canada"
          multiline
        />
      </FormField>
      <FormField label="Funding preference *">
        <FundingPicker value={funding} onChange={setFunding} />
      </FormField>
      {error ? <ErrorMessage message={error} /> : null}
    </OnboardingShell>
  );
}
