import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/providers/AuthProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import { WebFontProvider } from '@/providers/WebFontProvider';
import { QueryProvider } from '@/store/query-provider';

/**
 * Composes all app-level providers (Query, auth session, etc.).
 * SafeAreaProvider supplies insets; individual screens apply padding — tabs are not wrapped in SafeAreaView.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryProvider>
          <WebFontProvider>
            <AuthProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </AuthProvider>
          </WebFontProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
