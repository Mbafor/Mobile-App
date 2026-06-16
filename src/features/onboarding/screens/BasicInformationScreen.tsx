import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { CountrySelect, FormField } from '@/components/forms';
import { Input } from '@/components/ui';
import { OnboardingShell } from '@/features/onboarding/components';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useOnboardingGuard } from '@/features/onboarding/hooks/useOnboardingGuard';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import { ROUTES } from '@/constants/routes';

export function BasicInformationScreen() {
  const router = useRouter();
  useOnboardingGuard();

  const draft = useOnboardingStore((s) => s.draft.basic);
  const setBasic = useOnboardingStore((s) => s.setBasic);
  const loadFromServer = useOnboardingStore((s) => s.loadFromServer);
  const { profile, isLoading: loadingProfile } = useProfileData();
  const { saveBasicInfo, isLoading, error, clearError } = useOnboardingActions();

  const [fullName, setFullName] = useState(draft.fullName);
  const [country, setCountry] = useState(draft.country);

  useEffect(() => {
    if (profile) {
      loadFromServer({ basic: { fullName: profile.fullName ?? '', country: profile.country ?? '' } });
      setFullName(profile.fullName ?? '');
      setCountry(profile.country ?? '');
    }
  }, [loadFromServer, profile]);

  const handleContinue = async () => {
    clearError();
    if (!fullName.trim() || !country.trim()) {
      Alert.alert('Required fields', 'Please enter your full name and country.');
      return;
    }
    setBasic({ fullName, country });
    const ok = await saveBasicInfo({ fullName: fullName.trim(), country: country.trim() });
    if (ok) router.push(ROUTES.ONBOARDING.ACADEMIC);
  };

  return (
    <OnboardingShell
      currentStep={ONBOARDING_STEPS.BASIC}
      title="Basic information"
      subtitle="Tell us a bit about yourself to personalise your experience."
      onContinue={() => void handleContinue()}
      isLoading={isLoading || loadingProfile}
    >
      <FormField label="Full name *">
        <Input
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Jane Doe"
          autoComplete="name"
          leftIcon={<Ionicons name="person-outline" size={16} color="#9CA3AF" />}
        />
      </FormField>
      <FormField label="Country *">
        <CountrySelect value={country} onChange={setCountry} placeholder="Select your country" />
      </FormField>
      {error ? <ErrorMessage message={error} /> : null}
    </OnboardingShell>
  );
}
