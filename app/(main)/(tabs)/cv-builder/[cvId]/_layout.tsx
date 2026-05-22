import { Stack, useLocalSearchParams } from 'expo-router';

import { HideMainTabBar } from '@/features/cv-builder/components/hub/HideMainTabBar';
import { CVBuilderProvider } from '@/features/cv-builder/context/CVBuilderContext';
import { CVPaymentProvider } from '@/features/cv-builder/context/CVPaymentContext';

export default function CVIdLayout() {
  const params = useLocalSearchParams<{ cvId?: string }>();
  const cvId = typeof params.cvId === 'string' ? params.cvId : params.cvId?.[0];

  if (!cvId) {
    return null;
  }

  return (
    <CVBuilderProvider cvId={cvId}>
      <CVPaymentProvider cvId={cvId}>
        <HideMainTabBar>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="section/[sectionId]" />
          </Stack>
        </HideMainTabBar>
      </CVPaymentProvider>
    </CVBuilderProvider>
  );
}
