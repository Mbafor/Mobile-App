import { Stack, useLocalSearchParams, usePathname } from 'expo-router';
import { View } from 'react-native';

import { HideMainTabBar } from '@/features/cv-builder/components/hub/HideMainTabBar';
import { CVHubTopNav } from '@/features/cv-builder/components/hub/CVHubTopNav';
import { CVBuilderProvider } from '@/features/cv-builder/context/CVBuilderContext';
import { CVPaymentProvider } from '@/features/cv-builder/context/CVPaymentContext';
import { useWebDesktop } from '@/hooks/useWebDesktop';

export default function CVIdLayout() {
  const params = useLocalSearchParams<{ cvId?: string }>();
  const cvId = typeof params.cvId === 'string' ? params.cvId : params.cvId?.[0];
  const pathname = usePathname();
  const isDesktop = useWebDesktop();

  if (!cvId) {
    return null;
  }

  const isInSection = pathname.includes('/section/');
  const showTopNav = isDesktop && !isInSection;

  return (
    <CVBuilderProvider cvId={cvId}>
      <CVPaymentProvider cvId={cvId}>
        <HideMainTabBar>
          <View style={{ flex: 1 }}>
            {showTopNav && <CVHubTopNav cvId={cvId} />}
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="section/[sectionId]" />
            </Stack>
          </View>
        </HideMainTabBar>
      </CVPaymentProvider>
    </CVBuilderProvider>
  );
}
