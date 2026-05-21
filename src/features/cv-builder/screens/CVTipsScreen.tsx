import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { CVTipFaqItem } from '@/features/cv-builder/components/hub/CVTipFaqItem';
import { CV_TIPS } from '@/features/cv-builder/constants/cv-tips';
import { colors, spacing } from '@/constants/theme';

export function CVTipsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
    >
      <Text variant="title">CV Tips</Text>
      <Text muted style={styles.subtitle}>
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

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 20 },
  list: { gap: spacing.sm },
});
