import { FlatList, StyleSheet, View } from 'react-native';

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
};

export function OpportunitySection({
  title,
  opportunities,
  onCardPress,
}: OpportunitySectionProps) {
  const isDesktop = useWebDesktop();

  if (opportunities.length === 0) {
    return (
      <View style={styles.section}>
        <Text variant="title" style={[styles.heading, isDesktop && { paddingHorizontal: spacing.md }]}>
          {title}
        </Text>
        <EmptyState title="Nothing here yet" description="Check back soon for new listings." />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text variant="title" style={[styles.heading, isDesktop && { paddingHorizontal: spacing.md }]}>
        {title}
      </Text>
      <FlatList
        data={opportunities}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={OPPORTUNITY_CARD_WIDTH + spacing.md}
        contentContainerStyle={[styles.listContent, isDesktop && { paddingHorizontal: spacing.md }]}
        renderItem={({ item }) => (
          <OpportunityCard opportunity={item} onPress={onCardPress} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.lg },
  heading: {
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xs,
  },
});
