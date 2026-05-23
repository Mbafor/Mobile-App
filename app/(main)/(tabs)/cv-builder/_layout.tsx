import { Stack } from 'expo-router';

export default function CVBuilderTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[cvId]" options={{ headerShown: false }} />
    </Stack>
  );
}
