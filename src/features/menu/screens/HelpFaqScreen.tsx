import { ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { SUPPORT_EMAIL } from '@/constants/app';
import { colors, spacing } from '@/constants/theme';

const FAQ = [
  {
    q: 'How does recommendation work?',
    a: 'We match your profile interests and opportunity preferences to each listing’s tags. Opportunities with more matching tags appear first in Recommended For You.',
  },
  {
    q: 'How do I apply?',
    a: 'Open an opportunity and tap Apply Now to visit the official application link. Olives Forum lists opportunities for discovery — applications are handled by the host organization.',
  },
  {
    q: 'How do I turn off notifications?',
    a: 'Go to Settings → Notification preferences and toggle off push or specific alert types (new matches, deadline reminders, saved reminders).',
  },
  {
    q: 'How do I delete my account?',
    a: `Open Settings → Privacy and use Delete account. You can also email ${SUPPORT_EMAIL} and we will process your request.`,
  },
] as const;

export function HelpFaqScreen() {
  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="title" style={styles.title}>
          Help & FAQ
        </Text>
        {FAQ.map((item) => (
          <View key={item.q} style={styles.block}>
            <Text style={styles.question}>{item.q}</Text>
            <Text muted style={styles.answer}>
              {item.a}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  title: { marginBottom: spacing.sm },
  block: {
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  question: { fontWeight: '700', fontSize: 15, color: colors.text },
  answer: { lineHeight: 22 },
});
