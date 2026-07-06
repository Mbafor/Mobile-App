import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';

export default function ProfileLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Profile',
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="personal-info" options={{ title: 'Personal Info' }} />
      <Stack.Screen name="academic-info" options={{ title: 'Academic Info' }} />
      <Stack.Screen name="interests" options={{ title: 'Interests' }} />
      <Stack.Screen name="preferences" options={{ title: 'Opportunity Preferences' }} />
      <Stack.Screen name="bio" options={{ title: 'Bio' }} />
    </Stack>
  );
}
