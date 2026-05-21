import type { PropsWithChildren } from 'react';

import { AuthProvider } from '@/providers/AuthProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { QueryProvider } from '@/store/query-provider';

/**
 * Composes all app-level providers (Query, auth session, etc.).
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
