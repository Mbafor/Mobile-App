import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Accordion, Text } from '@/components/ui';
import { SUPPORT_EMAIL } from '@/constants/app';
import { colors, spacing, typography } from '@/constants/theme';

const FAQ = [
  {
    q: 'How does recommendation work?',
    a: "We match your profile interests and opportunity preferences to each listing's tags. Opportunities with more matching tags appear first in Recommended For You.",
  },
  {
    q: 'How do I apply?',
    a: 'Open an opportunity and tap Apply Now to visit the official application link. Olives Forum lists opportunities for discovery — applications are handled by the host organization.',
  },
  {
    q: 'How do I turn off notifications?',
    a: 'Go to Settings → Notification preferences and toggle off push or specific alert types.',
  },
  {
    q: 'How do I delete my account?',
    a: `Open Settings → Privacy and use Delete account. You can also email ${SUPPORT_EMAIL}.`,
  },
] as const;

export function HelpFaqScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');

  const filteredFaq = useMemo(() => {
    if (!search.trim()) return FAQ;

    return FAQ.filter((item) =>
      item.q.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const openEmail = async () => {
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    } catch {
      console.log('Unable to open email');
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back to dashboard"
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Tap a question to reveal the answer
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              insets.bottom + spacing.xl * 2,
          },
        ]}
      >
        {/* Search */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search FAQ..."
          placeholderTextColor={colors.textMuted}
          style={styles.search}
        />

    

        {/* FAQ */}
        <View style={styles.section}>
          {filteredFaq.length > 0 ? (
            filteredFaq.map((item) => (
              <Accordion
                key={item.q}
                title={item.q}
                defaultOpen={false}
              >
                <Text style={styles.answer}>
                  {item.a}
                </Text>
              </Accordion>
            ))
          ) : (
            <Text style={styles.empty}>
              No results found
            </Text>
          )}
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },

  subtitle: {
    marginTop: 2,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },

  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },

  search: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: '#E8F5EE',
    borderWidth: 1,
    borderColor: '#D7EBDD',
  },

  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C8E6D4',
  },

  bannerText: {
    flex: 1,
  },

  bannerTitle: {
    fontWeight: '600',
    color: '#1A3D25',
  },

  bannerSub: {
    marginTop: 2,
    color: '#2D6040',
    fontSize: typography.fontSize.sm,
  },

  section: {
    gap: spacing.md,
  },

  answer: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
    marginTop: spacing.xs,
  },

  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});