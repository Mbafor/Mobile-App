import { Stack } from 'expo-router';

import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';

export default function AdminTabLayout() {
  useRequireAdmin();

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="opportunities" options={{ title: 'Opportunities' }} />
      <Stack.Screen name="create" options={{ title: 'Create' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit' }} />
    </Stack>
  );
}
