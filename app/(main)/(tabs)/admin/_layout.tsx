import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { useTheme } from '@/hooks/useTheme';

const isWeb = Platform.OS === 'web';

export default function AdminTabLayout() {
  useRequireAdmin();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: !isWeb,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerLeft: () => <DrawerToggleButton tintColor={colors.text} />,
        headerRight: () => <AppHeaderActions />,
      }}
    >
      <Stack.Screen name="index" options={{ title: t('admin.titles.home') }} />
      <Stack.Screen
        name="pending"
        options={{ title: t('admin.titles.pending'), headerBackTitle: t('admin.backTitle') }}
      />
      <Stack.Screen
        name="create"
        options={{ title: t('admin.titles.create'), headerBackTitle: t('admin.backTitle') }}
      />
      <Stack.Screen
        name="paste"
        options={{ title: t('admin.titles.paste'), headerBackTitle: t('admin.backTitle') }}
      />
      <Stack.Screen
        name="weekly-digest"
        options={{ title: t('admin.titles.weeklyDigest'), headerBackTitle: t('admin.backTitle') }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{ title: t('admin.titles.edit'), headerBackTitle: t('admin.backTitle') }}
      />
      <Stack.Screen
        name="[id]/review"
        options={{ title: t('admin.titles.review'), headerBackTitle: t('admin.titles.reviewBackTitle') }}
      />
    </Stack>
  );
}
