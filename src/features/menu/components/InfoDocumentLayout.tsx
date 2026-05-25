import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';

type InfoDocumentLayoutProps = PropsWithChildren<{
  intro?: string;
  banner?: ReactNode;
}>;

export function InfoDocumentLayout({ intro, banner, children }: InfoDocumentLayoutProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {intro ? <Text muted style={styles.intro}>{intro}</Text> : null}
      {banner}
      <View style={styles.sections}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  intro: {
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  sections: {
    gap: spacing.md,
  },
});
