import { ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { SUPPORT_EMAIL } from '@/constants/app';
import { spacing } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Eligibility',
    body: 'Olives Forum is intended for students aged 18 and over. By using the app you confirm you meet this requirement.',
  },
  {
    title: 'Informational listings',
    body: 'Opportunities are posted for informational purposes. We strive for accuracy but do not guarantee completeness or availability of third-party programmes.',
  },
  {
    title: 'Third-party applications',
    body: 'We are not responsible for outcomes, decisions, or experiences related to applications made on external websites or with host organizations.',
  },
  {
    title: 'Acceptable use',
    body: 'Users must not misuse the platform, scrape data abusively, harass others, or post misleading content. We may suspend accounts that violate these terms.',
  },
  {
    title: 'Contact',
    body: `Legal inquiries: ${SUPPORT_EMAIL}`,
  },
] as const;

export function LegalTermsScreen() {
  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="title">Terms of Service</Text>
        <Text muted style={styles.updated}>
          Last updated: May 2026
        </Text>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.block}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  updated: { marginBottom: spacing.sm },
  block: { gap: spacing.xs },
  sectionTitle: { fontWeight: '700', fontSize: 16, color: '#333' },
  body: { lineHeight: 22, color: '#333' },
});
