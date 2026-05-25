import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Accordion, Text } from '@/components/ui';
import { InfoDocumentLayout } from '@/features/menu/components/InfoDocumentLayout';
import { SUPPORT_EMAIL } from '@/constants/app';
import { colors, spacing, typography } from '@/constants/theme';

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
    <InfoDocumentLayout
      intro="Rules and responsibilities for using Olives Forum."
      banner={
        <View style={styles.banner}>
          <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          <Text style={styles.bannerText}>Last updated: May 2026</Text>
        </View>
      }
    >
      {SECTIONS.map((section, index) => (
        <Accordion
          key={section.title}
          index={index + 1}
          title={section.title}
          defaultOpen={index === 0}
        >
          <Text style={styles.body}>{section.body}</Text>
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
    lineHeight: 22,
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
});
