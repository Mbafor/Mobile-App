import { useEffect } from 'react';
import { View } from 'react-native';

import { LoadingSpinner } from '@/components/feedback';
import { Text } from '@/components/ui';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';

/**
 * OAuth redirect target — session is set by WebBrowser flow before landing here.
 * Redirects once auth store is hydrated.
 */
export default function AuthCallbackScreen() {
  useAuthRedirect('bootstrap');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <LoadingSpinner />
      <Text muted>Completing sign-in…</Text>
    </View>
  );
}
