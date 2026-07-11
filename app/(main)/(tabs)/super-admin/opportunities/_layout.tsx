import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/constants/theme';

export default function SuperAdminOpportunitiesLayout() {
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
      <Stack.Screen name="index" options={{ title: t('admin.titles.home') }} />
      <Stack.Screen name="pending" options={{ title: t('admin.titles.pending'), headerBackTitle: t('admin.backTitle') }} />
      <Stack.Screen name="create" options={{ title: t('admin.titles.create'), headerBackTitle: t('admin.backTitle') }} />
      <Stack.Screen name="paste" options={{ title: t('admin.titles.paste'), headerBackTitle: t('admin.backTitle') }} />
      <Stack.Screen name="[id]/edit" options={{ title: t('admin.titles.edit'), headerBackTitle: t('admin.backTitle') }} />
      <Stack.Screen name="[id]/review" options={{ title: t('admin.titles.review'), headerBackTitle: t('admin.titles.reviewBackTitle') }} />
    </Stack>
  );
}
