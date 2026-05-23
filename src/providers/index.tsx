import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/providers/AuthProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { QueryProvider } from '@/store/query-provider';

/**
 * Composes all app-level providers (Query, auth session, etc.).
 * SafeAreaProvider supplies insets; individual screens apply padding — tabs are not wrapped in SafeAreaView.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
