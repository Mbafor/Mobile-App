import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

import { spacing } from '@/constants/theme';

export default function SuperAdminOpportunitiesLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Opportunities' }} />
      <Stack.Screen name="create" options={{ title: 'Create opportunity', headerBackTitle: 'Back' }} />
      <Stack.Screen name="paste" options={{ title: 'Paste opportunities', headerBackTitle: 'Back' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit opportunity', headerBackTitle: 'Back' }} />
    </Stack>
  );
}
