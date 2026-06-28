import * as Linking from 'expo-linking';
import { openExternalUrl } from '@/utils/web/openExternalUrl';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/components/ui';
import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';
import { spacing, typography } from '@/constants/theme';
import {
  TRACKER_STAGE_LABELS,
  nextTrackerStage,
} from '@/types/domain/tracker';
import { formatDeadline, daysUntilDeadline } from '@/utils/formatting';

type TrackerCardProps = {
  item: TrackerItem;
  onPress: (item: TrackerItem) => void;
  onAdvance: (item: TrackerItem) => void;
  onNotesCommit: (opportunityId: string, notes: string) => void;
  onDragStart: (item: TrackerItem) => void;
  onDragMove: (absoluteX: number, absoluteY: number) => void;
  onDragEnd: (absoluteX: number, absoluteY: number) => void;
  isDragging?: boolean;
};

function primaryTag(item: TrackerItem): string {
  if (item.opportunity.category) return item.opportunity.category;
  return item.opportunity.tags[0] ?? '';
}

function TrackerCardComponent({
  item,
  onPress,
  onAdvance,
  onNotesCommit,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDragging = false,
}: TrackerCardProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [notes, setNotes] = useState(item.notes);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

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

  const nextStage = nextTrackerStage(item.stage);
  const tag = primaryTag(item);
  const daysLeft = daysUntilDeadline(item.opportunity.deadline);
  const applyUrl = item.opportunity.applyUrl?.trim() ?? '';

  const handleApply = useCallback(async () => {
    if (!applyUrl) {
      Alert.alert('No apply link', 'This opportunity does not have an application URL yet.');
      return;
    }
    const canOpen = await Linking.canOpenURL(applyUrl);
    if (!canOpen) {
      Alert.alert('Invalid link', 'Could not open the application URL.');
      return;
    }
    await openExternalUrl(applyUrl);
  }, [applyUrl]);

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(280)
    .onStart(() => {
      scale.value = withSpring(1.03);
      runOnJS(onDragStart)(item);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      runOnJS(onDragMove)(e.absoluteX, e.absoluteY);
    })
    .onEnd((e) => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      runOnJS(onDragEnd)(e.absoluteX, e.absoluteY);
    })
    .onFinalize(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.92 : 1,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle, isDragging && styles.cardDragging]}>
        <Pressable onPress={() => onPress(item)}>
          <View style={styles.imageWrap}>
            {item.opportunity.imageUrl ? (
              <Image
                source={{ uri: item.opportunity.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Text style={styles.imageLetter}>
                  {item.opportunity.organization.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.title} numberOfLines={2}>
              {item.opportunity.title}
            </Text>
            <Text variant="caption" muted numberOfLines={1}>
              {item.opportunity.organization}
            </Text>
            <Text variant="caption" style={styles.deadline}>
              {formatDeadline(item.opportunity.deadline)}
              {daysLeft > 0 ? ` · ${daysLeft}d left` : ''}
            </Text>
            {tag ? (
              <View style={styles.tagPill}>
                <Text variant="caption" style={styles.tagText} numberOfLines={1}>
                  {tag}
                </Text>
              </View>
            ) : null}
          </View>
        </Pressable>

        {applyUrl ? (
          <Pressable
            onPress={() => void handleApply()}
            style={styles.applyLinkWrap}
            hitSlop={8}
            accessibilityRole="link"
            accessibilityLabel="Apply for this opportunity"
          >
            <Text style={styles.applyLink}>Apply</Text>
          </Pressable>
        ) : null}

        <TextInput
          value={notes}
          onChangeText={(text) => {
            setNotes(text);
            scheduleNotesCommit(text);
          }}
          onBlur={() => commitNotes(notes)}
          placeholder="Add a short note…"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={2}
          style={styles.notes}
          textAlignVertical="top"
        />

        {nextStage ? (
          <Pressable
            onPress={() => onAdvance(item)}
            style={styles.advanceBtn}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Move to ${TRACKER_STAGE_LABELS[nextStage]}`}
          >
            <Text style={styles.advanceBtnText}>→ {TRACKER_STAGE_LABELS[nextStage]}</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

export const TrackerCard = memo(TrackerCardComponent);

const IMAGE_HEIGHT = 56;

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDragging: {
    borderColor: colors.primary,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
  },
  imageWrap: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  imageLetter: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.background,
  },
  cardBody: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  deadline: { color: colors.primary, marginTop: 2 },
  applyLinkWrap: {
    alignSelf: 'flex-start',
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  applyLink: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  tagPill: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  tagText: { color: colors.primary, fontWeight: '600' },
  notes: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    minHeight: 44,
    maxHeight: 56,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  advanceBtn: {
    alignSelf: 'flex-start',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  advanceBtnText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
});
}
