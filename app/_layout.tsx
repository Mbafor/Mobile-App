import 'react-native-gesture-handler';

import { Stack } from 'expo-router';

import { ThemedStatusBar } from '@/components/layout/ThemedStatusBar';
import { AppProviders } from '@/providers';

export default function RootLayout() {
  return (
    <AppProviders>
      <ThemedStatusBar />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/callback" options={{ title: 'Signing in' }} />
        <Stack.Screen name="paystack-callback" options={{ title: 'Payment' }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </AppProviders>
  );
}
