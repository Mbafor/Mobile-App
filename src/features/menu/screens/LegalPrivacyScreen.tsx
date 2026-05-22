import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Accordion, Text } from '@/components/ui';
import { SUPPORT_EMAIL } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
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
    body: 'You may update your profile and preferences anytime. You can delete your account from Settings → Privacy. Contact us for any data requests.',
  },
  {
    title: 'Contact',
    body: `Questions about privacy: ${SUPPORT_EMAIL}`,
  },
] as const;

export function LegalPrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push(ROUTES.MAIN.DASHBOARD as Href)}
          style={styles.backBtn}
          hitSlop={12}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back to dashboard"
        >
          <Ionicons name="arrow-back" size={18} color={colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>How we collect, store, and protect your data</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xl * 2 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner */}
        <View style={styles.banner}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#1A3D25" />
          <Text style={styles.bannerText}>
            Last updated: May 2026
          </Text>
        </View>

        {/* Sections */}
        <View style={styles.section}>
          {SECTIONS.map((item, index) => (
            <Accordion
              key={`${item.title}-${index}`}
              title={item.title}
              defaultOpen={index === 0}
            >
              <Text style={styles.body}>{item.body}</Text>
            </Accordion>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },

  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#E8F5EE',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bannerText: {
    fontSize: typography.fontSize.sm,
    color: '#1A3D25',
    fontWeight: '500',
  },

  // Accordions
  section: {
    gap: spacing.sm,
  },
  body: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
});