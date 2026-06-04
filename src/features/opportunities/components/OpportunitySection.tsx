import { FlatList, Platform, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback';
import { Text } from '@/components/ui';
import {
  OpportunityCard,
  OPPORTUNITY_CARD_WIDTH,
} from '@/features/opportunities/components/OpportunityCard';
import { spacing } from '@/constants/theme';
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
  if (opportunities.length === 0) {
    return (
      <View style={styles.section}>
        <Text variant="title" style={styles.heading}>
          {title}
        </Text>
        <EmptyState title="Nothing here yet" description="Check back soon for new listings." />
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text variant="title" style={styles.heading}>
        {title}
      </Text>
      <FlatList
        data={opportunities}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={OPPORTUNITY_CARD_WIDTH + spacing.md}
        contentContainerStyle={styles.listContent}
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
    paddingHorizontal: Platform.OS === 'web' ? spacing.md : 0,
  },
  listContent: {
    paddingHorizontal: Platform.OS === 'web' ? spacing.md : 0,
    paddingBottom: spacing.xs,
  },
});
