import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { EmptyState } from '@/components/feedback';
import { Text } from '@/components/ui';
import {
  OpportunityCard,
  OPPORTUNITY_CARD_WIDTH,
} from '@/features/opportunities/components/OpportunityCard';
import { spacing } from '@/constants/theme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import type { Opportunity } from '@/types/domain/opportunity';

type OpportunitySectionProps = {
  title: string;
  opportunities: Opportunity[];
  onCardPress?: (opportunity: Opportunity) => void;
  onViewAll?: () => void;
};

export function OpportunitySection({
  title,
  opportunities,
  onCardPress,
  onViewAll,
}: OpportunitySectionProps) {
  const styles = useThemedStyles(createStyles);
  const isDesktop = useWebDesktop();

  if (opportunities.length === 0) {
    return (
      <View style={styles.section}>
        <View style={[styles.headerRow, { paddingHorizontal: isDesktop ? spacing.md : spacing.sm }]}>
          <Text variant="title" style={styles.heading}>
            {title}
          </Text>
          {onViewAll && (
            <Pressable onPress={onViewAll} accessibilityRole="link">
              <Text style={styles.viewAllText}>All opportunities →</Text>
            </Pressable>
          )}
        </View>
        <EmptyState title="Nothing here yet" description="Check back soon for new listings." />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={[styles.headerRow, { paddingHorizontal: isDesktop ? spacing.md : spacing.sm }]}>
        <Text variant="title" style={styles.heading}>
          {title}
        </Text>
        {onViewAll && (
          <Pressable onPress={onViewAll} accessibilityRole="link">
            <Text style={styles.viewAllText}>All opportunities →</Text>
          </Pressable>
        )}
      </View>
      <FlatList
        data={opportunities}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={OPPORTUNITY_CARD_WIDTH + spacing.md}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: isDesktop ? spacing.md : spacing.sm }]}
        renderItem={({ item }) => (
          <OpportunityCard opportunity={item} onPress={onCardPress} />
        )}
      />
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  section: { marginBottom: spacing.lg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heading: {
    marginBottom: 0,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing.xs,
  },
});
}
