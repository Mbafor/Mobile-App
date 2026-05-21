import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { BROWSE_CATEGORIES, categoryToSlug } from '@/constants/browse-categories';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';

export function BrowseCategoriesScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Text variant="title">Browse by category</Text>
      <Text muted style={styles.subtitle}>
        Tap a category to see matching opportunities.
      </Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {BROWSE_CATEGORIES.map((category) => (
          <Pressable
            key={category}
            style={styles.card}
            onPress={() =>
              router.push(ROUTES.MAIN.DRAWER.category(categoryToSlug(category)) as Href)
            }
          >
            <Text style={styles.cardText}>{category}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginBottom: spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  card: {
    width: '47%',
    minHeight: 72,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  cardText: { fontWeight: '600', color: colors.text, fontSize: 14 },
});
