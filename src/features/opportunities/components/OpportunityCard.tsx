import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { Image, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui';
import { useToggleSaveOpportunity } from '@/features/opportunities/hooks/useToggleSaveOpportunity';
import { SharePreviewSheet } from '@/features/opportunities/components/SharePreviewSheet';
import { spacing, typography } from '@/constants/theme';
import { formatDeadline, daysUntilDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

const CARD_WIDTH = 280;
const IMAGE_HEIGHT = 140;

type OpportunityCardProps = {
  opportunity: Opportunity;
  onPress?: (opportunity: Opportunity) => void;
  style?: StyleProp<ViewStyle>;
};

function OpportunityCardComponent({ opportunity, onPress, style }: OpportunityCardProps) {
  const styles = useThemedStyles(createStyles);
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { isSaved, toggleSave, isSaving } = useToggleSaveOpportunity(opportunity.id);
  const [shareVisible, setShareVisible] = useState(false);
  const actionIconColor = isDark ? '#FFFFFF' : styles.actionIcon.color;

  const daysLeft = daysUntilDeadline(opportunity.deadline);
  const deadlineLabel =
    daysLeft <= 14
      ? `${formatDeadline(opportunity.deadline)} · ${t('opportunities.common.daysLeft', { days: daysLeft })}`
      : formatDeadline(opportunity.deadline);

  const handleSavePress = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.();
    if (!isSaving) toggleSave();
  };

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={() => onPress?.(opportunity)}
      accessibilityRole="button"
    >
      <View style={styles.imageWrap}>
        {opportunity.imageUrl ? (
          <Image source={{ uri: opportunity.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>{opportunity.organization.charAt(0)}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {opportunity.title}
        </Text>
        <Text variant="caption" muted numberOfLines={1}>
          {opportunity.organization}
        </Text>
        <Text variant="caption" style={styles.deadline}>
          {deadlineLabel}
        </Text>

        {opportunity.tags.length > 0 ? (
          <View style={styles.tags}>
            {opportunity.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleSavePress();
            }}
            hitSlop={8}
            accessibilityLabel={isSaved ? t('opportunities.card.unsave') : t('opportunities.card.save')}
            disabled={isSaving}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={actionIconColor}
            />
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setShareVisible(true);
            }}
            hitSlop={8}
            accessibilityLabel={t('opportunities.card.share')}
          >
            <Ionicons name="share-social-outline" size={20} color={actionIconColor} />
          </Pressable>
        </View>
      </View>

      <SharePreviewSheet
        opportunity={opportunity}
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
      />
    </Pressable>
  );
}

export const OpportunityCard = memo(OpportunityCardComponent);

export const OPPORTUNITY_CARD_WIDTH = CARD_WIDTH;

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  imageWrap: { backgroundColor: colors.surface },
  image: { width: '100%', height: IMAGE_HEIGHT },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.background,
  },
  body: { padding: spacing.md, gap: spacing.xs },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  deadline: { color: colors.text, marginTop: 2 },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    maxWidth: 120,
  },
  tagText: { fontSize: 11, color: colors.textMuted },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionIcon: { fontSize: 20, color: colors.primary },
});
}
