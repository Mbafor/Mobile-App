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
import { buildEventWebLink } from '@/features/events/utils/event-share-link';
import { buildEventShareMessage } from '@/features/events/utils/share-event';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { formatEventDateTime } from '@/utils/formatting';
import { APP_WEB_BASE_URL } from '@/constants/app';
import type { Event } from '@/types/domain/event';
import { openExternalUrl } from '@/utils/web/openExternalUrl';

function EventDateBadge({ eventDate }: { eventDate: string }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <View style={[styles.dateBadge, { backgroundColor: colors.surface }]}>
      <Ionicons name="calendar-outline" size={13} color={colors.text} />
      <Text style={[styles.dateBadgeText, { color: colors.text }]}>{formatEventDateTime(eventDate)}</Text>
    </View>
  );
}

/** Compact row used in the related events sidebar/bottom section — mirrors RelatedOpportunityCard. */
function RelatedEventRow({
  event,
  onPress,
}: {
  event: Event;
  onPress: (e: Event) => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      style={({ pressed }) => [styles.relatedCard, pressed && { opacity: 0.8 }]}
      onPress={() => onPress(event)}
      accessibilityRole="button"
    >
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.relatedThumb} contentFit="cover" />
      ) : (
        <View style={[styles.relatedThumb, styles.relatedThumbPlaceholder]}>
          <Text style={styles.relatedThumbLetter}>{event.title.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.relatedBody}>
        <Text style={styles.relatedTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.relatedDate}>{formatEventDateTime(event.eventDate)}</Text>
      </View>
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

  const eventLink = useMemo(() => {
    if (!event) return '';
    return buildEventWebLink(event.id);
  }, [event]);

  const shareSection = useMemo(() => {
    if (!event) return null;
    return (
      <View style={styles.shareSectionInner}>
        <Text style={styles.shareLabel}>{t('events.detail.shareVia')}</Text>
        <View style={styles.shareIconsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.shareIconBtn,
              { backgroundColor: '#EAF8F2' },
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => {
              const text = buildEventShareMessage(event, eventLink);
              void openExternalUrl(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('events.detail.shareWhatsapp')}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.shareIconBtn,
              { backgroundColor: '#EAF3FC' },
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => {
              void openExternalUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventLink)}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('events.detail.shareLinkedin')}
          >
            <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.shareIconBtn,
              { backgroundColor: '#EBF2FC' },
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => {
              void openExternalUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventLink)}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('events.detail.shareFacebook')}
          >
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
          </Pressable>
        </View>
      </View>
    );
  }, [event, eventLink, styles, t]);

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

  const metaParts: string[] = [
    event.locationType === 'virtual' ? t('events.common.virtual') : t('events.common.inPerson'),
    ...(event.locationOrLink ? [event.locationOrLink] : []),
    ...(event.category ? [event.category] : []),
  ];

  const mainContent = (
    <ScrollView
      contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.heroImage} contentFit="cover" />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroInitial}>{initial}</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.body}>
        <Text style={[styles.title, getWebFontStyle('bold')]}>{event.title}</Text>

        <EventDateBadge eventDate={event.eventDate} />

        {metaParts.length > 0 ? (
          <Text style={styles.meta}>{metaParts.join('  ·  ')}</Text>
        ) : null}

        {event.category ? (
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{event.category}</Text>
            </View>
          </View>
        ) : null}

        {event.postedBy ? (
          <View style={styles.postedByRow}>
            <Ionicons name="person-circle-outline" size={15} color={colors.textMuted} />
            <Text style={styles.meta}>
              {t('events.detail.postedBy', { name: event.postedBy.name })}
            </Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        <Text style={[styles.sectionHeading, getWebFontStyle('semibold')]}>
          {t('events.detail.about')}
        </Text>
        <Text style={styles.description}>
          {event.description?.trim() || t('events.detail.noDescription')}
        </Text>

        {/* Action button — inside scroll so user scrolls to find it */}
        <View style={styles.actionSection}>
          <Button fullWidth onPress={handleRegister}>
            {t('events.detail.register')}
          </Button>
          {/* Share links — directly below the action button */}
          <View style={styles.inlineShareWrapper}>
            {shareSection}
          </View>
        </View>

        {/* Related events at the bottom on mobile */}
        {!isDesktop && relatedEvents.length > 0 && (
          <View style={styles.mobileRelatedSection}>
            <Text style={[styles.sidebarHeading, getWebFontStyle('semibold')]}>
              {t('events.detail.youMightAlsoLike')}
            </Text>
            {relatedEvents.map((e) => (
              <RelatedEventRow key={e.id} event={e} onPress={handleRelatedPress} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.root}>
      <PageHeader title={t('events.detail.header')} />

      {isDesktop ? (
        <View style={styles.desktopLayout}>
          <View style={styles.mainCol}>{mainContent}</View>
          <View style={styles.sidebarCol}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {relatedEvents.length > 0 && (
                <>
                  <Text style={[styles.sidebarHeading, getWebFontStyle('semibold')]}>
                    {t('events.detail.youMightAlsoLike')}
                  </Text>
                  {relatedEvents.map((e) => (
                    <RelatedEventRow key={e.id} event={e} onPress={handleRelatedPress} />
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      ) : (
        mainContent
      )}
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    errorBody: { padding: spacing.lg, gap: spacing.md },

    // Desktop two-column layout
    desktopLayout: {
      flex: 1,
      flexDirection: 'row',
      maxWidth: 1280,
      width: '100%',
      alignSelf: 'center',
    },
    mainCol: { flex: 2 },
    sidebarCol: {
      flex: 1,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
    },
    sidebarHeading: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
      letterSpacing: -0.1,
    },

    scroll: {
      paddingBottom: spacing.xl * 2,
    },
    scrollDesktop: {
      // no maxWidth here — the desktopLayout handles constraint
    },

    // ─── Hero ──────────────────────────────────────────────────────────────────
    heroImage: { width: '100%', height: 240 },
    heroPlaceholder: {
      width: '100%',
      height: 180,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroInitial: {
      fontSize: 72,
      fontWeight: '800',
      color: `${colors.textOnPrimary}E6`,
      letterSpacing: -3,
    },

    // ─── Body ──────────────────────────────────────────────────────────────────
    body: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      gap: spacing.md,
    },

    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
      lineHeight: 34,
      letterSpacing: -0.4,
    },

    dateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 2,
      borderRadius: 999,
    },
    dateBadgeText: { fontSize: 13, fontWeight: '600' },

    meta: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },

    postedByRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },

    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    tag: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tagText: { fontSize: 12, color: colors.text, fontWeight: '500' },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },

    sectionHeading: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.1,
    },
    description: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 28,
    },

    // ─── Action button (below description, inside scroll) ──────────────────────
    actionSection: {
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: spacing.sm,
    },

    // Share section — inline below the action button
    inlineShareWrapper: {
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    shareSectionInner: {
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    shareLabel: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600',
      letterSpacing: -0.1,
    },
    shareIconsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    shareIconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Mobile related layout
    mobileRelatedSection: {
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingBottom: spacing.sm,
    },

    // ─── Related event row ───────────────────────────────────────────────────
    relatedCard: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    relatedThumb: { width: 60, height: 60, borderRadius: 8 },
    relatedThumbPlaceholder: {
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    relatedThumbLetter: { color: colors.textOnPrimary, fontWeight: '700', fontSize: 18 },
    relatedBody: { flex: 1, gap: 2 },
    relatedTitle: { fontSize: 13, fontWeight: '600', color: colors.text, lineHeight: 18 },
    relatedDate: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  });
}
