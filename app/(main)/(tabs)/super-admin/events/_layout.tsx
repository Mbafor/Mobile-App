import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

export default function SuperAdminEventsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="index" options={{ title: t('events.admin.titles.home') }} />
      <Stack.Screen
        name="create"
        options={{ title: t('events.admin.titles.create'), headerBackTitle: t('admin.backTitle') }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{ title: t('events.admin.titles.edit'), headerBackTitle: t('admin.backTitle') }}
      />
    </Stack>
  );
}
