import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';

export default function ProfileLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: t('settings.profile.title'),
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="personal-info" options={{ title: t('settings.profile.personalInfo') }} />
      <Stack.Screen name="academic-info" options={{ title: t('settings.profile.academicInfo') }} />
      <Stack.Screen name="interests" options={{ title: t('settings.profile.interests') }} />
      <Stack.Screen name="preferences" options={{ title: t('settings.profile.opportunityPreferences') }} />
      <Stack.Screen name="bio" options={{ title: t('settings.profile.bio') }} />
    </Stack>
  );
}
