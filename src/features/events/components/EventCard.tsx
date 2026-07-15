import { memo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { formatEventDateShort } from '@/utils/formatting';
import type { Event } from '@/types/domain/event';

const CARD_WIDTH = 280;
const IMAGE_HEIGHT = 140;

type EventCardProps = {
  event: Event;
  onPress?: (event: Event) => void;
  style?: StyleProp<ViewStyle>;
};

function EventCardComponent({ event, onPress, style }: EventCardProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={() => onPress?.(event)}
      accessibilityRole="button"
    >
      <View style={styles.imageWrap}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="calendar-outline" size={32} color={styles.placeholderText.color} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <Text variant="caption" style={styles.dateRow}>
          {formatEventDateShort(event.eventDate)}
        </Text>

        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText} numberOfLines={1}>
              {event.locationType === 'virtual'
                ? t('events.common.virtual')
                : t('events.common.inPerson')}
            </Text>
          </View>
          {event.category ? (
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {event.category}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export const EventCard = memo(EventCardComponent);

export const EVENT_CARD_WIDTH = CARD_WIDTH;

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
      color: colors.background,
    },
    body: { padding: spacing.md, gap: spacing.xs },
    title: {
      fontSize: typography.fontSize.md,
      fontWeight: '700',
      color: colors.text,
    },
    dateRow: { color: colors.text, marginTop: 2 },
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
      maxWidth: 140,
    },
    tagText: { fontSize: 11, color: colors.textMuted },
  });
}
