import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { BROWSE_CATEGORIES, categoryToSlug } from '@/constants/browse-categories';
import { ROUTES } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';

// Assign a soft accent color to each card by index
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
          <Text style={styles.title}>Browse categories</Text>
          <Text style={styles.subtitle}>Find opportunities by focus area.</Text>
        </View>
      </View>

      {/* Grid */}
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
              {/* Accent dot */}
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

  // Grid
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