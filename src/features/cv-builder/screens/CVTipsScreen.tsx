import { ScrollView, StyleSheet, View } from 'react-native';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { CVTipFaqItem } from '@/features/cv-builder/components/hub/CVTipFaqItem';
import { CV_TIPS } from '@/features/cv-builder/constants/cv-tips';
import { spacing } from '@/constants/theme';

export function CVTipsScreen() {
  const styles = useAppThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, spacing.md) + spacing.md },
      ]}
    >
      <Text style={[styles.subtitle, { color: cvDocsTheme.textOnPage }]}>
        Tap a tip to expand the full explanation.
      </Text>

      <View style={styles.list}>
        {CV_TIPS.map((tip) => (
          <CVTipFaqItem key={tip.id} title={tip.title} body={tip.body} />
        ))}
      </View>
    </ScrollView>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  scroll: { flex: 1, backgroundColor: cvDocsTheme.pageBg },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 20 },
  list: { gap: spacing.sm },
});
}
