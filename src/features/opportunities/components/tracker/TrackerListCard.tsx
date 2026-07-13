import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Text } from '@/components/ui';
import {
  getDeadlineBadgeColors,
  getDeadlineUrgency,
  getStageChipColors,
} from '@/features/opportunities/constants/tracker-ui';
import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';
import { spacing, typography } from '@/constants/theme';
import { TRACKER_STAGE_ORDER } from '@/types/domain/tracker';
import { daysUntilDeadline } from '@/utils/formatting';

type TrackerListCardProps = {
  item: TrackerItem;
  onPress: (item: TrackerItem) => void;
  onOpenStatusSheet: (item: TrackerItem) => void;
  onNotesCommit: (opportunityId: string, notes: string) => void;
  highlighted?: boolean;
};

function TrackerListCardComponent({
  item,
  onPress,
  onOpenStatusSheet,
  onNotesCommit,
  highlighted = false,
}: TrackerListCardProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [noteOpen, setNoteOpen] = useState(false);
  const [notes, setNotes] = useState(item.notes);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNotes(item.notes);
  }, [item.notes]);

  const commitNotes = useCallback(
    (value: string) => {
      if (value === item.notes) return;
      onNotesCommit(item.opportunityId, value);
    },
    [item.notes, item.opportunityId, onNotesCommit],
  );

  const scheduleNotesCommit = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => commitNotes(value), 600);
    },
    [commitNotes],
  );

  const currentIndex = TRACKER_STAGE_ORDER.indexOf(item.stage);
  const daysLeft = daysUntilDeadline(item.opportunity.deadline);
  const hasDeadline = Boolean(item.opportunity.deadline);
  const urgency = getDeadlineUrgency(daysLeft);
  const deadlineColors = getDeadlineBadgeColors(urgency, colors);
  const chipColors = getStageChipColors(item.stage, colors);

  const deadlineText = !hasDeadline
    ? t('opportunities.tracker.deadlineNone')
    : daysLeft <= 0
      ? t('opportunities.tracker.deadlinePassed')
      : t('opportunities.tracker.deadlineDaysLeft', { count: daysLeft });

  return (
    <View style={[styles.card, highlighted && styles.cardHighlighted]}>
      <Pressable onPress={() => onPress(item)} accessibilityRole="button">
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {item.opportunity.title}
            </Text>
            <Text variant="caption" muted numberOfLines={1}>
              {item.opportunity.organization}
            </Text>
          </View>
          <View style={[styles.deadlineBadge, { backgroundColor: deadlineColors.background }]}>
            <Text style={[styles.deadlineText, { color: deadlineColors.text }]} numberOfLines={1}>
              {deadlineText}
            </Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            {TRACKER_STAGE_ORDER.map((stage, i) => (
              <View
                key={stage}
                style={[
                  styles.progressSeg,
                  i <= currentIndex && { backgroundColor: colors.primary },
                  i === TRACKER_STAGE_ORDER.length - 1 && styles.progressSegLast,
                ]}
              />
            ))}
          </View>
          <View style={styles.progressLabels}>
            {TRACKER_STAGE_ORDER.map((stage) => (
              <Text
                key={stage}
                style={[
                  styles.progressLabel,
                  stage === item.stage && {
                    color: colors.primary,
                    fontWeight: '700',
                  },
                ]}
                numberOfLines={1}
              >
                {t(`opportunities.tracker.stages.${stage}`)}
              </Text>
            ))}
          </View>
        </View>
      </Pressable>

      <View style={styles.bottomRow}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onOpenStatusSheet(item);
          }}
          style={[styles.statusChip, { backgroundColor: chipColors.background }]}
          accessibilityRole="button"
          accessibilityLabel={t('opportunities.tracker.statusSheetTitle')}
        >
          <View style={[styles.statusDot, { backgroundColor: chipColors.text }]} />
          <Text style={[styles.statusChipText, { color: chipColors.text }]}>
            {t(`opportunities.tracker.stages.${item.stage}`)}
          </Text>
          <Text style={[styles.chevron, { color: chipColors.text }]}>▾</Text>
        </Pressable>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            setNoteOpen((v) => !v);
          }}
          style={styles.noteBtn}
          hitSlop={8}
        >
          <Text style={styles.noteBtnText} numberOfLines={1}>
            📝{' '}
            {notes.trim()
              ? t('opportunities.tracker.noteBtnEdit')
              : t('opportunities.tracker.noteBtnAdd')}
          </Text>
        </Pressable>
      </View>

      {noteOpen ? (
        <TextInput
          value={notes}
          onChangeText={(text) => {
            setNotes(text);
            scheduleNotesCommit(text);
          }}
          onBlur={() => commitNotes(notes)}
          placeholder={t('opportunities.tracker.notesPlaceholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={2}
          autoFocus
          style={styles.notesInput}
          textAlignVertical="top"
        />
      ) : null}
    </View>
  );
}

export const TrackerListCard = memo(TrackerListCardComponent);

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: spacing.md,
      paddingBottom: spacing.sm + 4,
    },
    cardHighlighted: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    titleBlock: { flex: 1, gap: 2 },
    title: { fontSize: 15, fontWeight: '700', color: colors.text, lineHeight: 20 },
    deadlineBadge: {
      flexShrink: 0,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
    },
    deadlineText: { fontSize: 11, fontWeight: '700' },
    progressRow: { marginTop: spacing.sm + 4 },
    progressTrack: {
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    progressSeg: {
      flex: 1,
      backgroundColor: colors.border,
      marginRight: 2,
    },
    progressSegLast: { marginRight: 0 },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 5,
    },
    progressLabel: {
      fontSize: 9.5,
      color: colors.textMuted,
      flexShrink: 1,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm + 4,
    },
    statusChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.sm + 4,
      paddingVertical: 7,
      borderRadius: 20,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusChipText: { fontSize: 12.5, fontWeight: '700' },
    chevron: { fontSize: 10, opacity: 0.7 },
    noteBtn: { paddingVertical: 4, paddingHorizontal: 4 },
    noteBtnText: { fontSize: 11.5, color: colors.textMuted },
    notesInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      fontSize: typography.fontSize.sm,
      color: colors.text,
      minHeight: 44,
      maxHeight: 56,
      marginTop: spacing.sm,
      backgroundColor: colors.surface,
    },
  });
}
