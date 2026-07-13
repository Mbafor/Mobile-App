import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { buildOpportunityWebLink } from '@/features/opportunities/utils/opportunity-share-link';
import { shareOpportunity } from '@/features/opportunities/utils/share-opportunity';
import { formatDeadline, daysUntilDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

interface Props {
  opportunity: Opportunity;
  visible: boolean;
  onClose: () => void;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function SharePreviewSheet({ opportunity, visible, onClose }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const [sharing, setSharing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isDesktop = Platform.OS === 'web' && screenWidth >= 768;

  const daysLeft = daysUntilDeadline(opportunity.deadline);
  const link = buildOpportunityWebLink(opportunity.id);

  const sheetWidth = Math.min(screenWidth, 600);
  const imageWidth = sheetWidth - spacing.lg * 2;
  const imageHeight = Math.round(imageWidth * 0.48);

  const showImage = Boolean(opportunity.imageUrl) && !imageError;
  const isUrgent = daysLeft <= 7;
  const isNearDeadline = daysLeft <= 14;

  const descWords = opportunity.description?.trim().split(/\s+/) ?? [];
  const snippet = descWords.slice(0, 55).join(' ');
  const hasMore = descWords.length > 55;

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareOpportunity(opportunity);
      onClose();
    } catch {
      Alert.alert(t('opportunities.share.failedTitle'), t('opportunities.share.failedBody'));
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, isDesktop && styles.overlayDesktop]}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: colors.background, width: sheetWidth }, isDesktop && styles.sheetDesktop]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* ── Sheet header ── */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('opportunities.share.title')}</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel={t('opportunities.share.close')}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            {/* ── Preview card ── */}
            <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.background }]}>

              {/* Hero image */}
              {showImage ? (
                <Image
                  source={{ uri: opportunity.imageUrl! }}
                  style={{ width: imageWidth, height: imageHeight }}
                  contentFit="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={[styles.imagePlaceholder, { width: imageWidth, height: imageHeight, backgroundColor: `${colors.primary}18` }]}>
                  <View style={[styles.placeholderIconWrap, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.placeholderLetter, { color: colors.textOnPrimary }]}>
                      {opportunity.organization.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.cardBody}>

                {/* Category badge */}
                {opportunity.category ? (
                  <View style={[styles.categoryBadge, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
                    <Text style={[styles.categoryText, { color: colors.primary }]}>
                      {capitalize(opportunity.category)}
                    </Text>
                  </View>
                ) : null}

                {/* Title */}
                <Text style={[styles.title, { color: colors.text }]}>
                  {opportunity.title}
                </Text>

                {/* Organization */}
                <View style={styles.metaRow}>
                  <Ionicons name="business-outline" size={13} color={colors.textMuted} />
                  <Text style={[styles.metaText, { color: colors.textMuted }]} numberOfLines={1}>
                    {opportunity.organization}
                  </Text>
                </View>

                {/* Location + funding pills */}
                {(opportunity.locationType || opportunity.fundingType || opportunity.country) ? (
                  <View style={styles.pillRow}>
                    {opportunity.country ? (
                      <View style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="location-outline" size={10} color={colors.textMuted} />
                        <Text style={[styles.pillText, { color: colors.textMuted }]}>
                          {opportunity.country}
                        </Text>
                      </View>
                    ) : null}
                    {opportunity.locationType ? (
                      <View style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="globe-outline" size={10} color={colors.textMuted} />
                        <Text style={[styles.pillText, { color: colors.textMuted }]}>
                          {t(`opportunities.share.location.${opportunity.locationType}`, { defaultValue: opportunity.locationType })}
                        </Text>
                      </View>
                    ) : null}
                    {opportunity.fundingType ? (
                      <View style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="cash-outline" size={10} color={colors.textMuted} />
                        <Text style={[styles.pillText, { color: colors.textMuted }]}>
                          {capitalize(opportunity.fundingType)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Deadline section */}
                <View style={styles.deadlineSection}>
                  <View style={styles.deadlineLeft}>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('opportunities.share.deadlineLabel')}</Text>
                    <Text style={[styles.deadlineDate, { color: colors.text }]}>
                      {formatDeadline(opportunity.deadline)}
                    </Text>
                  </View>
                  {isNearDeadline && (
                    <View style={[
                      styles.urgencyBadge,
                      { backgroundColor: isUrgent ? '#FEF2F2' : '#FFF7ED', borderColor: isUrgent ? '#FECACA' : '#FED7AA' },
                    ]}>
                      <Ionicons
                        name={isUrgent ? 'warning-outline' : 'time-outline'}
                        size={11}
                        color={isUrgent ? '#DC2626' : '#EA580C'}
                      />
                      <Text style={[styles.urgencyText, { color: isUrgent ? '#DC2626' : '#EA580C' }]}>
                        {daysLeft === 0 ? t('opportunities.share.closesToday') : t('opportunities.common.daysLeft', { days: daysLeft })}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Divider */}
                {snippet ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}

                {/* About section */}
                {snippet ? (
                  <View style={styles.aboutSection}>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('opportunities.share.aboutLabel')}</Text>
                    <Text style={[styles.description, { color: colors.text }]}>
                      {snippet}{hasMore ? '…' : ''}
                    </Text>
                  </View>
                ) : null}

                {/* Tags */}
                {opportunity.tags.length > 0 ? (
                  <>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.tagsRow}>
                      {opportunity.tags.slice(0, 4).map((tag) => (
                        <View key={tag} style={[styles.tag, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}25` }]}>
                          <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Link */}
                <View style={[styles.linkBox, { backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}20` }]}>
                  <View style={[styles.linkIconWrap, { backgroundColor: colors.primary }]}>
                    <Ionicons name="link" size={12} color={colors.textOnPrimary} />
                  </View>
                  <View style={styles.linkTextWrap}>
                    <Text style={[styles.linkLabel, { color: colors.textMuted }]}>{t('opportunities.share.viewAt')}</Text>
                    <Text style={[styles.linkUrl, { color: colors.primary }]} numberOfLines={1}>
                      {link}
                    </Text>
                  </View>
                </View>

              </View>
            </View>

            {/* Branding footer */}
            <View style={styles.brandRow}>
              <Text style={[styles.brandText, { color: colors.textMuted }]}>
                {t('opportunities.share.sharedViaPrefix')}{' '}
                <Text style={[styles.brandName, { color: colors.primary }]}>Voila Africa</Text>
                {' '}{t('opportunities.share.sharedViaSuffix')}
              </Text>
            </View>
          </ScrollView>

          {/* Action footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={() => void handleShare()}
              disabled={sharing}
              style={({ pressed }) => [
                styles.shareBtn,
                { backgroundColor: colors.primary },
                sharing && styles.shareBtnBusy,
                pressed && !sharing && styles.shareBtnPressed,
              ]}
              accessibilityRole="button"
            >
              <Ionicons
                name={sharing ? 'hourglass-outline' : 'share-social-outline'}
                size={18}
                color={colors.textOnPrimary}
              />
              <Text style={[styles.shareBtnText, { color: colors.textOnPrimary }]}>
                {sharing ? t('opportunities.share.opening') : t('opportunities.share.shareButton')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlayDesktop: {
    justifyContent: 'center',
    padding: 32,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  sheetDesktop: {
    borderRadius: 16,
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 4,
  },
  // ── Sheet header ────────────────────────────────────────────────────────────
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLetter: {
    fontSize: 30,
    fontWeight: '800',
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  // ── Category badge ───────────────────────────────────────────────────────────
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // ── Title & org ──────────────────────────────────────────────────────────────
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  // ── Pills ────────────────────────────────────────────────────────────────────
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  // ── Divider ──────────────────────────────────────────────────────────────────
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xs,
  },
  // ── Deadline ─────────────────────────────────────────────────────────────────
  deadlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  deadlineLeft: {
    gap: 2,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  deadlineDate: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    flexShrink: 0,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // ── About ────────────────────────────────────────────────────────────────────
  aboutSection: {
    gap: spacing.xs,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 21,
    fontWeight: '400',
  },
  // ── Tags ─────────────────────────────────────────────────────────────────────
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // ── Link box ─────────────────────────────────────────────────────────────────
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
  },
  linkIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  linkTextWrap: {
    flex: 1,
    gap: 1,
  },
  linkLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  linkUrl: {
    fontSize: 12,
    fontWeight: '600',
  },
  // ── Brand row ─────────────────────────────────────────────────────────────────
  brandRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  brandText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  brandName: {
    fontWeight: '700',
  },
  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: 14,
    shadowColor: '#0B6623',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  shareBtnBusy: { opacity: 0.6 },
  shareBtnPressed: { opacity: 0.85 },
});
