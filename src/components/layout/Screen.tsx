import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer';
import { colors, spacing } from '@/constants/theme';

type ScreenProps = PropsWithChildren<{
  padded?: boolean;
}>;

export function Screen({ children, padded = true }: ScreenProps) {
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
});
