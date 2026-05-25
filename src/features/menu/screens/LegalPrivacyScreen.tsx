import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Accordion, Text } from '@/components/ui';
import { InfoDocumentLayout } from '@/features/menu/components/InfoDocumentLayout';
import { SUPPORT_EMAIL } from '@/constants/app';
import { colors, spacing, typography } from '@/constants/theme';

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
    body: 'Data is stored securely with row-level security so users can only access their own records. Authentication is handled by Supabase Auth.',
  },
  {
    title: 'We never sell your data',
    body: 'Olives Forum does not sell or rent personal data to third parties.',
  },
  {
    title: 'Your rights',
    body: 'You may update your profile and preferences anytime in Settings. Contact us for any data export or deletion requests.',
  },
  {
    title: 'Contact',
    body: `Questions about privacy: ${SUPPORT_EMAIL}`,
  },
] as const;

export function LegalPrivacyScreen() {
  return (
    <InfoDocumentLayout
      intro="How we collect, store, and protect your data."
      banner={
        <View style={styles.banner}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <Text style={styles.bannerText}>Last updated: May 2026</Text>
        </View>
      }
    >
      {SECTIONS.map((item, index) => (
        <Accordion
          key={item.title}
          index={index + 1}
          title={item.title}
          defaultOpen={index === 0}
        >
          <Text style={styles.body}>{item.body}</Text>
        </Accordion>
      ))}
    </InfoDocumentLayout>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#E8F5EE',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#D7EBDD',
  },
  bannerText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  body: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
