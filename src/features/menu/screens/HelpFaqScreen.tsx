import { useMemo, useState } from 'react';
import * as Linking from 'expo-linking';
import { StyleSheet, TextInput, View } from 'react-native';

import { Accordion, Text } from '@/components/ui';
import { InfoDocumentLayout } from '@/features/menu/components/InfoDocumentLayout';
import { SUPPORT_EMAIL } from '@/constants/app';
import { colors, spacing } from '@/constants/theme';

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
    q: 'How do I share an opportunity?',
    a: 'Tap Share on a card or opportunity page. We attach the listing image (when available), plus title, organisation, deadline, and one link to open the opportunity in Olives Forum. Recipients need an account to view details.',
  },
  {
    q: 'How do I turn off notifications?',
    a: 'Open Settings → Notifications and toggle off push or specific alert types.',
  },
  {
    q: 'How do I delete my account?',
    a: `Open Settings → Privacy for data guidance, or email ${SUPPORT_EMAIL} to request deletion.`,
  },
] as const;

export function HelpFaqScreen() {
  const [search, setSearch] = useState('');

  const filteredFaq = useMemo(() => {
    if (!search.trim()) return FAQ;
    const q = search.toLowerCase();
    return FAQ.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
    );
  }, [search]);

  const openEmail = async () => {
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    } catch {
      // no-op
    }
  };

  return (
    <InfoDocumentLayout
      intro="Tap a numbered question to expand the answer."
      banner={
        <View style={styles.searchWrap}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search FAQ…"
            placeholderTextColor={colors.textMuted}
            style={styles.search}
          />
        </View>
      }
    >
      {filteredFaq.length > 0 ? (
        filteredFaq.map((item, idx) => {
          const originalIndex = FAQ.findIndex((f) => f.q === item.q) + 1;
          return (
            <Accordion key={item.q} index={originalIndex} title={item.q} defaultOpen={idx === 0}>
              <Text style={styles.answer}>{item.a}</Text>
              {item.q.includes('delete') ? (
                <Text style={styles.link} onPress={() => void openEmail()}>
                  Email {SUPPORT_EMAIL}
                </Text>
              ) : null}
            </Accordion>
          );
        })
      ) : (
        <Text style={styles.empty} muted>
          No results found
        </Text>
      )}
    </InfoDocumentLayout>
  );
}

const styles = StyleSheet.create({
  searchWrap: { marginBottom: spacing.xs },
  search: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  answer: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
  },
  link: {
    marginTop: spacing.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  empty: { textAlign: 'center', marginTop: spacing.lg },
});
