import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ThemedStatusBar } from '@/components/layout/ThemedStatusBar';
import { AppProviders } from '@/providers';

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <AppProviders>
      <ThemedStatusBar />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/callback" options={{ title: t('navigation.rootTitles.signingIn') }} />
        <Stack.Screen name="paystack-callback" options={{ title: t('navigation.rootTitles.payment') }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </AppProviders>
  );
}
