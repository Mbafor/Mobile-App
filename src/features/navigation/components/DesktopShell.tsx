import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { DesktopSidebar } from '@/features/navigation/components/DesktopSidebar';
import { DesktopHeader } from '@/features/navigation/components/DesktopHeader';
import { DesktopFooter } from '@/features/navigation/components/DesktopFooter';

type DesktopShellProps = {
  children: ReactNode;
  rightSlot?: ReactNode;
};

/**
 * Persistent sidebar + header + footer chrome for web desktop viewports.
 * Used by the (tabs) navigator, and by standalone routes outside it (e.g. help)
 * that should still show the same sidebar instead of falling back to the
 * bare drawer header.
 */
export function DesktopShell({ children, rightSlot }: DesktopShellProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.webRoot}>
      <View style={styles.desktopBody}>
        <DesktopSidebar />
        <View
          style={[
            styles.desktopContent,
            Platform.OS === 'web' && ({ overflowY: 'auto' } as object),
          ]}
        >
          <DesktopHeader rightSlot={rightSlot} />
          <View
            style={[
              styles.contentMain,
              Platform.OS === 'web' && ({ minHeight: '100%' } as object),
            ]}
          >
            {children}
          </View>
          <DesktopFooter />
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    webRoot: { flex: 1, backgroundColor: colors.background },
    desktopBody: { flex: 1, flexDirection: 'row' },
    desktopContent: { flex: 1, flexDirection: 'column' },
    contentMain: { flex: 1 },
  });
}
