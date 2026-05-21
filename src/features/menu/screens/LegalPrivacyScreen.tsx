import { ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { SUPPORT_EMAIL } from '@/constants/app';
import { spacing } from '@/constants/theme';

const SECTIONS = [
  {
    title: 'Data we collect',
    body: 'Account email, profile details (name, country, university, degree, interests), opportunity preferences, saved/applied activity, and notification history.',
  },
  {
    title: 'Why we collect it',
    body: 'To personalize recommendations, save your opportunities, send relevant reminders, and improve the platform experience.',
  },
  {
    title: 'How it is stored',
    body: 'Data is stored securely in Supabase (PostgreSQL) with row-level security so users can only access their own records. Authentication is handled by Supabase Auth.',
  },
  {
    title: 'We never sell your data',
    body: 'Olives Forum does not sell or rent personal data to third parties.',
  },
  {
    title: 'Your rights',
    body: 'You may update your profile and preferences anytime. You can delete your account from Settings → Privacy. Contact us for any data requests.',
  },
  {
    title: 'Contact',
    body: `Questions about privacy: ${SUPPORT_EMAIL}`,
  },
] as const;

export function LegalPrivacyScreen() {
  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="title">Privacy Policy</Text>
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
