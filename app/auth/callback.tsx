import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { ErrorMessage, LoadingSpinner } from '@/components/feedback';
import { Text } from '@/components/ui';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import {
  completeOAuthFromUrl,
  urlHasAuthCallbackParams,
} from '@/features/auth/utils/oauth';

/**
 * OAuth redirect target (web + native deep link).
 * Completes PKCE / token exchange when the app opens on this route.
 */
export default function AuthCallbackScreen() {
  const [error, setError] = useState<string | null>(null);
  useAuthRedirect('bootstrap');

  useEffect(() => {
    let mounted = true;

    const finishOAuth = async (callbackUrl: string | null) => {
      try {
        if (!callbackUrl || !urlHasAuthCallbackParams(callbackUrl)) {
          return;
        }

        await completeOAuthFromUrl(callbackUrl);

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/auth/callback');
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : 'Sign-in failed');
        }
      }
    };

    const resolveCallbackUrl = (): string | null => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return window.location.href;
      }
      return Linking.getLinkingURL();
    };

    void finishOAuth(resolveCallbackUrl());

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void finishOAuth(url);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
        <ErrorMessage message={error} />
        <Text muted>Close this tab and try again from the welcome screen.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <LoadingSpinner />
      <Text muted>Completing sign-in…</Text>
    </View>
  );
}
