import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { BROWSE_CATEGORIES, categoryToSlug } from '@/constants/browse-categories';
import { ROUTES } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';

const CARD_ACCENTS = [
  { bg: '#E8F5EE', text: '#1A3D25' },
  { bg: '#EAF0FB', text: '#1A2E5A' },
  { bg: '#FDF3E7', text: '#5A3A10' },
  { bg: '#F3EEF9', text: '#3A1A5A' },
  { bg: '#E8F5F0', text: '#1A3D2E' },
  { bg: '#FBF0EA', text: '#5A2A10' },
  { bg: '#EAF4FB', text: '#1A3A5A' },
  { bg: '#F9EEF3', text: '#5A1A3A' },
];

export function BrowseCategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={styles.intro}>
        <Text style={styles.subtitle}>Find opportunities by focus area.</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {BROWSE_CATEGORIES.map((category, i) => {
          const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
          return (
            <Pressable
              key={category}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: accent.bg, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() =>
                router.push(ROUTES.MAIN.DRAWER.category(categoryToSlug(category)) as Href)
              }
            >
              <View style={[styles.dot, { backgroundColor: accent.text + '22' }]} />
              <Text style={[styles.cardText, { color: accent.text }]}>
                {category}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={accent.text}
                style={styles.cardArrow}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  intro: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
  },
  card: {
    width: '47%',
    minHeight: 96,
    padding: spacing.md,
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
  },
  cardArrow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
});
