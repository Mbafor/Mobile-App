import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Accordion, Text } from '@/components/ui';
import { Screen as LayoutScreen } from '@/components/layout';
import { SUPPORT_EMAIL } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';

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
  const router = useRouter();

  return (
    <LayoutScreen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push(ROUTES.MAIN.DASHBOARD as Href)}
            style={styles.backBtn}
            hitSlop={12}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back to dashboard"
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.headerContent}>
            <Text variant="title">Read the rules and responsibilities for using Olives Forum</Text>
        
          </View>
        </View>

        <Text muted style={styles.updated}>
          Last updated: May 2026
        </Text>

        <View style={styles.section}>
          {SECTIONS.map((section, index) => (
            <Accordion key={`${section.title}-${index}`} title={section.title} defaultOpen={index === 0}>
              <Text style={styles.body}>{section.body}</Text>
            </Accordion>
          ))}
        </View>
      </ScrollView>
    </LayoutScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { flex: 1, gap: spacing.xs },
  subtitle: { marginTop: spacing.xs, color: colors.textMuted },
  updated: { marginBottom: spacing.sm, color: colors.textMuted },
  section: { gap: spacing.sm },
  body: { lineHeight: 22, color: colors.text },
});
