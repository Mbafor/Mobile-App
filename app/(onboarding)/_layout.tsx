import { Stack } from 'expo-router';

import { useOnboardingGuard } from '@/features/onboarding/hooks/useOnboardingGuard';

export default function OnboardingLayout() {
  useOnboardingGuard();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="basic-information" />
      <Stack.Screen name="academic-information" />
      <Stack.Screen name="opportunity-preferences" />
    </Stack>
  );
}
