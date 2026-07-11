import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      Alert.alert(t('onboarding.basic.requiredTitle'), t('onboarding.basic.requiredMessage'));
      return;
    }
    setBasic({ fullName, country });
    const ok = await saveBasicInfo({ fullName: fullName.trim(), country: country.trim() });
    if (ok) router.push(ROUTES.ONBOARDING.ACADEMIC);
  };

  return (
    <OnboardingShell
      currentStep={ONBOARDING_STEPS.BASIC}
      title={t('onboarding.basic.title')}
      subtitle={t('onboarding.basic.subtitle')}
      onContinue={() => void handleContinue()}
      isLoading={isLoading || loadingProfile}
    >
      <FormField label={t('onboarding.basic.fullNameLabel')}>
        <Input
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('onboarding.basic.fullNamePlaceholder')}
          autoComplete="name"
        />
      </FormField>
      <FormField label={t('onboarding.basic.countryLabel')}>
        <CountrySelect value={country} onChange={setCountry} placeholder={t('onboarding.basic.countryPlaceholder')} />
      </FormField>
      {error ? <ErrorMessage message={error} /> : null}
    </OnboardingShell>
  );
}
