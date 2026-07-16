import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { DesktopShell } from '@/features/navigation/components';
import { AppHeaderActions } from '@/features/menu/components/AppHeaderActions';
import { useTheme } from '@/hooks/useTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';

export default function HelpLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isWebDesktop = useWebDesktop();

  const stack = (
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

  if (isWebDesktop) {
    return <DesktopShell rightSlot={<AppHeaderActions />}>{stack}</DesktopShell>;
  }

  return stack;
}
