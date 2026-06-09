import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
}>;

export function Screen({ children, padded = true }: ScreenProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.safe}>
      <ResponsiveContainer
        style={styles.content}
        minHorizontalPadding={padded ? spacing.md : 0}
      >
        {children}
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1 },
  });
}
