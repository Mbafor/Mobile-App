import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { CountrySelect, FormField } from '@/components/forms';
import { Screen } from '@/components/layout';
import { Button, Input, Text } from '@/components/ui';
import { OnboardingProgress } from '@/features/onboarding/components';
import { useOnboardingActions } from '@/features/onboarding/hooks/useOnboardingActions';
import { useOnboardingGuard } from '@/features/onboarding/hooks/useOnboardingGuard';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { useOnboardingStore } from '@/features/onboarding/store/onboarding.store';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import { ROUTES } from '@/constants/routes';
import { spacing } from '@/constants/theme';

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
      loadFromServer({
        basic: {
          fullName: profile.fullName ?? '',
          country: profile.country ?? '',
        },
      });
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
    if (ok) {
      router.push(ROUTES.ONBOARDING.ACADEMIC);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <OnboardingProgress currentStep={ONBOARDING_STEPS.BASIC} />
        <Text variant="title">Basic information</Text>
        <Text muted style={styles.subtitle}>
          Tell us a bit about yourself to personalize your experience.
        </Text>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <FormField label="Full name *">
            <Input
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Jane Doe"
              autoComplete="name"
            />
          </FormField>

          <FormField label="Country *">
            <CountrySelect value={country} onChange={setCountry} placeholder="Select your country" />
          </FormField>

          {error ? <ErrorMessage message={error} /> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={handleContinue}
            loading={isLoading || loadingProfile}
            disabled={isLoading || loadingProfile}
          >
            Continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  subtitle: { marginBottom: spacing.md },
  scroll: { flex: 1 },
  footer: { paddingTop: spacing.md },
});
