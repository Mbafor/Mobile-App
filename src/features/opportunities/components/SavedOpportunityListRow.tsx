import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { OpportunityListRow } from '@/features/opportunities/components/OpportunityListRow';
import { useToggleSaveOpportunity } from '@/features/opportunities/hooks/useToggleSaveOpportunity';
import { spacing } from '@/constants/theme';
import type { Opportunity } from '@/types/domain/opportunity';

type SavedOpportunityListRowProps = {
  opportunity: Opportunity;
  onPress?: (opportunity: Opportunity) => void;
};

function SavedOpportunityListRowComponent({ opportunity, onPress }: SavedOpportunityListRowProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { toggleSave, isSaving } = useToggleSaveOpportunity(opportunity.id);

  return (
    <View style={styles.wrap}>
      <OpportunityListRow opportunity={opportunity} onPress={onPress} showSaveButton={false} />
      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleSave()}
          disabled={isSaving}
          style={[styles.unsaveBtn, isSaving && styles.unsaveBtnDisabled]}
        >
          <Text style={styles.unsaveText}>
            {isSaving ? t('opportunities.saved.removing') : t('opportunities.saved.unsave')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export const SavedOpportunityListRow = memo(SavedOpportunityListRowComponent);

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: { backgroundColor: colors.background },
  actions: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    marginTop: -spacing.xs,
  },
  unsaveBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  unsaveBtnDisabled: { opacity: 0.6 },
  unsaveText: { color: colors.error, fontWeight: '600', fontSize: 13 },
});
}
