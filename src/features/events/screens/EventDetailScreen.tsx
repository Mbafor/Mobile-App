import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Text } from '@/components/ui';
import { useEventDetail } from '@/features/events/hooks/useEventDetail';
import { useUpcomingEvents } from '@/features/events/hooks/useUpcomingEvents';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { formatEventDateTime } from '@/utils/formatting';
import { APP_WEB_BASE_URL } from '@/constants/app';
import type { Event } from '@/types/domain/event';
import { openExternalUrl } from '@/utils/web/openExternalUrl';

function RelatedEventCard({ event, onPress }: { event: Event; onPress: () => void }) {
  const styles = useThemedStyles(createStyles);
  const initial = event.title.charAt(0).toUpperCase();

  return (
    <Pressable style={styles.relatedCard} onPress={onPress} accessibilityRole="button">
      <View style={styles.relatedImageWrap}>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.relatedImage} contentFit="cover" />
        ) : (
          <View style={[styles.relatedImage, styles.relatedImagePlaceholder]}>
            <Text style={styles.relatedInitial}>{initial}</Text>
          </View>
        )}
      </View>
      <Text style={styles.relatedTitle} numberOfLines={2}>
        {event.title}
      </Text>
      <Text variant="caption" muted>
        {formatEventDateTime(event.eventDate)}
      </Text>
    </Pressable>
  );
}

export function EventDetailScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isDesktop = useWebDesktop();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = typeof id === 'string' ? id : id?.[0];

  const { data: event, isLoading, error } = useEventDetail(eventId);
  const { data: allEvents } = useUpcomingEvents();

  const relatedEvents = useMemo(() => {
    if (!event || !allEvents) return [];
    return allEvents
      .filter((e) => e.id !== event.id && e.category && e.category === event.category)
      .slice(0, 5);
  }, [event, allEvents]);

  const handleRelatedPress = (e: Event) => {
    router.push({ pathname: '/(main)/event/[id]', params: { id: e.id } });
  };

  const handleRegister = () => {
    if (!event) return;
    void openExternalUrl(`${APP_WEB_BASE_URL}/e/${event.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.root}>
        <PageHeader title={t('events.detail.header')} />
        <View style={styles.errorBody}>
          <ErrorMessage
            message={error instanceof Error ? error.message : t('events.detail.notFound')}
          />
          <Button variant="secondary" onPress={() => router.back()}>
            {t('events.detail.goBack')}
          </Button>
        </View>
      </View>
    );
  }

  const initial = event.title.charAt(0).toUpperCase();

  return (
    <View style={styles.root}>
      <PageHeader title={t('events.detail.header')} />
      <ScrollView
        contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroInitial}>{initial}</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={[styles.title, getWebFontStyle('bold')]}>{event.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatEventDateTime(event.eventDate)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons
              name={event.locationType === 'virtual' ? 'videocam-outline' : 'location-outline'}
              size={15}
              color={colors.textMuted}
            />
            <Text style={styles.metaText}>
              {event.locationType === 'virtual'
                ? t('events.common.virtual')
                : t('events.common.inPerson')}
              {event.locationOrLink ? ` · ${event.locationOrLink}` : ''}
            </Text>
          </View>

          {event.category ? (
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{event.category}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.divider} />

          <Text style={[styles.sectionHeading, getWebFontStyle('semibold')]}>
            {t('events.detail.about')}
          </Text>
          <Text style={styles.description}>
            {event.description?.trim() || t('events.detail.noDescription')}
          </Text>

          <View style={styles.actionSection}>
            <Button fullWidth onPress={handleRegister}>
              {t('events.detail.register')}
            </Button>
          </View>

          {relatedEvents.length > 0 ? (
            <View style={styles.relatedSection}>
              <Text style={[styles.sectionHeading, getWebFontStyle('semibold')]}>
                {t('events.detail.youMightAlsoLike')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.relatedRow}>
                  {relatedEvents.map((e) => (
                    <RelatedEventCard key={e.id} event={e} onPress={() => handleRelatedPress(e)} />
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    errorBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
    scroll: { paddingBottom: spacing.xl },
    scrollDesktop: { maxWidth: 760, width: '100%', alignSelf: 'center' },
    heroImage: { width: '100%', height: 260 },
    heroPlaceholder: {
      width: '100%',
      height: 260,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    heroInitial: { fontSize: 48, fontWeight: '700', color: colors.background },
    body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.md },
    title: { fontSize: 26, fontWeight: '700', color: colors.text, lineHeight: 34, letterSpacing: -0.4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    metaText: { fontSize: 14, color: colors.textMuted, flexShrink: 1 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    tag: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tagText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
    sectionHeading: { fontSize: 17, fontWeight: '700', color: colors.text },
    description: { fontSize: 15, lineHeight: 22, color: colors.text },
    actionSection: { marginTop: spacing.sm },
    relatedSection: { marginTop: spacing.lg, gap: spacing.sm },
    relatedRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.xs },
    relatedCard: { width: 180 },
    relatedImageWrap: { borderRadius: 10, overflow: 'hidden', backgroundColor: colors.surface },
    relatedImage: { width: 180, height: 100 },
    relatedImagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
    relatedInitial: { fontSize: 24, fontWeight: '700', color: colors.background },
    relatedTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: spacing.xs },
  });
}
