import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { useToggleSaveOpportunity } from '@/features/opportunities/hooks/useToggleSaveOpportunity';
import { spacing, typography } from '@/constants/theme';
import { formatDeadline, daysUntilDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

type OpportunityListRowProps = {
  opportunity: Opportunity;
  onPress?: (opportunity: Opportunity) => void;
  showSaveButton?: boolean;
};

function OpportunityListRowComponent({
  opportunity,
  onPress,
  showSaveButton = true,
}: OpportunityListRowProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isSaved, toggleSave, isSaving } = useToggleSaveOpportunity(opportunity.id);
  const daysLeft = daysUntilDeadline(opportunity.deadline);

  return (
    <Pressable style={styles.row} onPress={() => onPress?.(opportunity)}>
      {opportunity.imageUrl ? (
        <Image source={{ uri: opportunity.imageUrl }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Text style={styles.thumbLetter}>{opportunity.organization.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {opportunity.title}
        </Text>
        <Text variant="caption" muted numberOfLines={1}>
          {opportunity.organization}
        </Text>
        <Text variant="caption" style={styles.deadline}>
          {formatDeadline(opportunity.deadline)}
          {daysLeft > 0 ? ` · ${t('opportunities.common.daysLeft', { days: daysLeft })}` : ''}
        </Text>
        {opportunity.tags.length > 0 ? (
          <Text variant="caption" muted numberOfLines={1}>
            {opportunity.tags.slice(0, 2).join(' · ')}
          </Text>
        ) : null}
      </View>
      {showSaveButton ? (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            if (!isSaving) toggleSave();
          }}
          hitSlop={8}
          disabled={isSaving}
          style={styles.saveBtn}
          accessibilityLabel={isSaved ? t('opportunities.card.unsave') : t('opportunities.card.save')}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? colors.primary : colors.textMuted}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export const OpportunityListRow = memo(OpportunityListRowComponent);

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  thumb: { width: 72, height: 72, borderRadius: 8 },
  thumbPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbLetter: { color: colors.background, fontWeight: '700', fontSize: 20 },
  content: { flex: 1, gap: 2 },
  title: { fontSize: typography.fontSize.md, fontWeight: '600', color: colors.text },
  deadline: { color: colors.text },
  saveBtn: { padding: spacing.xs },
});
}
