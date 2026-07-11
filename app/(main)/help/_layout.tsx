import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';

export default function HelpLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.text,
        headerBackTitle: t('help.backTitle'),
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="report-bug" options={{ title: t('help.titles.reportBug') }} />
      <Stack.Screen name="feature-request" options={{ title: t('help.titles.featureRequest') }} />
      <Stack.Screen name="feedback" options={{ title: t('help.titles.feedback') }} />
    </Stack>
  );
}
