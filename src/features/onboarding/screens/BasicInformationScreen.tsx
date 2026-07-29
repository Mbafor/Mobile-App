import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; country?: string }>({});

  useEffect(() => {
    if (profile) {
      loadFromServer({ basic: { fullName: profile.fullName ?? '', country: profile.country ?? '' } });
      setFullName(profile.fullName ?? '');
      setCountry(profile.country ?? '');
    }
  }, [loadFromServer, profile]);

  const handleContinue = async () => {
    clearError();
    const nextErrors: { fullName?: string; country?: string } = {};
    if (!fullName.trim()) nextErrors.fullName = t('onboarding.basic.fullNameError');
    if (!country.trim()) nextErrors.country = t('onboarding.basic.countryError');
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
      <FormField label={t('onboarding.basic.fullNameLabel')} error={fieldErrors.fullName}>
        <Input
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          placeholder={t('onboarding.basic.fullNamePlaceholder')}
          autoComplete="name"
          error={Boolean(fieldErrors.fullName)}
        />
      </FormField>
      <FormField label={t('onboarding.basic.countryLabel')} error={fieldErrors.country}>
        <CountrySelect
          value={country}
          onChange={(value) => {
            setCountry(value);
            if (fieldErrors.country) setFieldErrors((prev) => ({ ...prev, country: undefined }));
          }}
          placeholder={t('onboarding.basic.countryPlaceholder')}
          error={Boolean(fieldErrors.country)}
        />
      </FormField>
      {error ? <ErrorMessage message={error} /> : null}
    </OnboardingShell>
  );
}
