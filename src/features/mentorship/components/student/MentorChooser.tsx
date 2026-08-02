import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchField } from '@/components/ui/SearchField';
import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { MentorBrowseCard } from '@/features/mentorship/components/student/MentorBrowseCard';
import { ParticipantProfileDetail } from '@/features/mentorship/components/shared/ParticipantProfileDetail';
import {
  MENTOR_BROWSE_FILTERS,
  type MentorBrowseFilterId,
} from '@/features/mentorship/constants/mentor-browse-filters';
import { useAvailableMentors } from '@/features/mentorship/hooks/useAvailableMentors';
import {
  filterAvailableMentors,
  getPopularMentors,
  partitionRecommendedMentors,
  platformHasNoCoaches,
  shouldOfferWaitingList,
} from '@/features/mentorship/utils/filter-available-mentors';
import type { AvailableMentor } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';

const CATEGORY_EMOJI: Record<MentorBrowseFilterId, string> = {
  all: '✨',
  technology: '💻',
  business: '💼',
  career: '📈',
  scholarships: '🎓',
  research: '🔬',
  entrepreneurship: '🚀',
};

type MentorChooserProps = {
  onSelect: (mentorUserId: string) => void;
  onJoinWaitingList?: () => void;
  isSelecting?: boolean;
  selectingMentorId?: string | null;
};

export function MentorChooser({
  onSelect,
  onJoinWaitingList,
  isSelecting,
  selectingMentorId,
}: MentorChooserProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isDesktop = useWebDesktop();
  const { data, isLoading, error, refetch, isFetching } = useAvailableMentors({ enabled: true });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MentorBrowseFilterId>('all');
  const [profileMentor, setProfileMentor] = useState<AvailableMentor | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [degreeLevels, setDegreeLevels] = useState<string[]>([]);
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  const mentors = useMemo(() => data ?? [], [data]);

  const availableDegreeLevels = useMemo(() => {
    const set = new Set<string>();
    mentors.forEach((m) => {
      m.mentor.mentoringDegreeLevels.forEach((d) => set.add(d));
      if (m.profile.degreeLevel) set.add(m.profile.degreeLevel);
    });
    return [...set].sort();
  }, [mentors]);

  const categoryFiltered = useMemo(
    () => filterAvailableMentors(mentors, search, category),
    [mentors, search, category],
  );

  const filtered = useMemo(() => {
    return categoryFiltered.filter((m) => {
      if (acceptingOnly && !(m.isAcceptingStudents && m.hasCapacity)) return false;
      if (degreeLevels.length > 0) {
        const mentorLevels = [...m.mentor.mentoringDegreeLevels, m.profile.degreeLevel].filter(
          (v): v is string => Boolean(v),
        );
        if (!mentorLevels.some((lvl) => degreeLevels.includes(lvl))) return false;
      }
      return true;
    });
  }, [categoryFiltered, acceptingOnly, degreeLevels]);

  const { recommended, all } = useMemo(() => partitionRecommendedMentors(filtered), [filtered]);
  const popular = useMemo(() => getPopularMentors(filtered), [filtered]);
  const activeFilterCount =
    degreeLevels.length + (acceptingOnly ? 1 : 0) + (category !== 'all' ? 1 : 0);

  const showWaitingList = !isLoading && !error && shouldOfferWaitingList(mentors);
  const showEmptySearch =
    !isLoading && !error && !showWaitingList && mentors.length > 0 && filtered.length === 0;
  const listMentors = all;

  const toggleDegreeLevel = (level: string) => {
    setDegreeLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));
  };

  if (isLoading || (isFetching && mentors.length === 0)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text muted>{t('mentorship.student.chooser.loadError')}</Text>
        <Button onPress={() => void refetch()}>{t('mentorship.retry')}</Button>
      </View>
    );
  }

  if (showWaitingList) {
    return (
      <View style={styles.waitingWrap}>
        <View style={styles.waitingIconWrap}>
          <Ionicons name="hourglass-outline" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.waitingTitle, getWebFontStyle('bold')]}>
          {t('mentorship.student.chooser.noCoachesTitle')}
        </Text>
        <Text muted style={styles.waitingBody}>
          {platformHasNoCoaches(mentors)
            ? t('mentorship.student.chooser.noCoachesPlatform')
            : t('mentorship.student.chooser.noCoachesFull')}
        </Text>
        {onJoinWaitingList ? (
          <Button fullWidth onPress={onJoinWaitingList} loading={isSelecting}>
            {t('mentorship.student.chooser.joinWaitingList')}
          </Button>
        ) : null}
      </View>
    );
  }

  const renderHorizontal = (items: AvailableMentor[]) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalRow}
    >
      {items.map((m) => (
        <MentorBrowseCard
          key={m.mentorUserId}
          mentor={m}
          onViewProfile={() => setProfileMentor(m)}
          onChoose={() => onSelect(m.mentorUserId)}
          isChoosing={isSelecting && selectingMentorId === m.mentorUserId}
        />
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.root}>
      {/* Label + search + filters */}
      <View style={styles.toolbar}>
        <View style={[styles.toolbarRow, isDesktop && styles.toolbarRowDesktop]}>
          <Text style={styles.toolbarLabel}>{t('mentorship.student.chooser.findCoachLabel')}</Text>

          <View style={[styles.searchRow, isDesktop && styles.searchRowDesktop]}>
            <View style={styles.searchField}>
              <SearchField
                value={search}
                onChangeText={setSearch}
                placeholder={t('mentorship.student.chooser.searchPlaceholder')}
              />
            </View>
            <Pressable
              style={styles.filterBtn}
              onPress={() => setFiltersOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t('mentorship.student.chooser.filters')}
            >
              <Ionicons name="options-outline" size={18} color={colors.text} />
              {activeFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Recommended */}
      {recommended.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('mentorship.student.chooser.recommended')}</Text>
          {renderHorizontal(recommended)}
        </View>
      ) : null}

      {/* Popular */}
      {popular.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('mentorship.student.chooser.popular')}</Text>
          {renderHorizontal(popular)}
        </View>
      ) : null}

      {/* All coaches */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {recommended.length > 0
            ? t('mentorship.student.chooser.allCoaches')
            : t('mentorship.student.chooser.resultsCount', { count: filtered.length })}
        </Text>

        {showEmptySearch ? (
          <Text muted style={styles.emptyText}>
            {t('mentorship.student.chooser.emptySearch')}
          </Text>
        ) : listMentors.length === 0 ? (
          <Text muted style={styles.emptyText}>{t('mentorship.student.chooser.emptyList')}</Text>
        ) : (
          renderHorizontal(listMentors)
        )}
      </View>

      {/* Filters sheet */}
      <Modal
        visible={filtersOpen}
        transparent
        animationType={isDesktop ? 'fade' : 'slide'}
        onRequestClose={() => setFiltersOpen(false)}
      >
        <Pressable
          style={[styles.sheetOverlay, isDesktop && styles.sheetOverlayDesktop]}
          onPress={() => setFiltersOpen(false)}
        >
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + spacing.md },
              isDesktop && styles.sheetDesktop,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>{t('mentorship.student.chooser.filtersTitle')}</Text>
              <Pressable onPress={() => setFiltersOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={styles.sheetScroll}>
              <View style={styles.filterGroupFirst}>
                <Text style={styles.filterGroupLabel}>{t('mentorship.student.chooser.filterCategory')}</Text>
                <View style={styles.chipWrapRow}>
                  {MENTOR_BROWSE_FILTERS.map((chip) => {
                    const active = category === chip.id;
                    return (
                      <Pressable
                        key={chip.id}
                        onPress={() => setCategory(chip.id)}
                        style={[styles.chipPill, active && styles.chipPillActive]}
                      >
                        <Text style={styles.chipPillEmoji}>{CATEGORY_EMOJI[chip.id]}</Text>
                        <Text style={[styles.chipPillText, active && styles.chipPillTextActive]}>
                          {t(`mentorship.student.browseFilters.${chip.id}`)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                style={styles.toggleRow}
                onPress={() => setAcceptingOnly((v) => !v)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptingOnly }}
              >
                <Text style={styles.toggleLabel}>{t('mentorship.student.chooser.filterAvailableOnly')}</Text>
                <View style={[styles.checkbox, acceptingOnly && styles.checkboxActive]}>
                  {acceptingOnly ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                </View>
              </Pressable>

              {availableDegreeLevels.length > 0 ? (
                <View style={styles.filterGroup}>
                  <Text style={styles.filterGroupLabel}>{t('mentorship.student.chooser.filterDegreeLevel')}</Text>
                  <View style={styles.chipWrapRow}>
                    {availableDegreeLevels.map((level) => {
                      const active = degreeLevels.includes(level);
                      return (
                        <Pressable
                          key={level}
                          onPress={() => toggleDegreeLevel(level)}
                          style={[styles.chipPill, active && styles.chipPillActive]}
                        >
                          <Text style={[styles.chipPillText, active && styles.chipPillTextActive]}>{level}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <Button
                variant="secondary"
                style={styles.sheetFooterBtn}
                onPress={() => {
                  setDegreeLevels([]);
                  setAcceptingOnly(false);
                  setCategory('all');
                }}
              >
                {t('mentorship.student.chooser.clearFilters')}
              </Button>
              <Button style={styles.sheetFooterBtn} onPress={() => setFiltersOpen(false)}>
                {t('mentorship.student.chooser.applyFilters')}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Profile bottom sheet */}
      <Modal
        visible={profileMentor != null}
        transparent
        animationType={isDesktop ? 'fade' : 'slide'}
        onRequestClose={() => setProfileMentor(null)}
      >
        <Pressable
          style={[styles.sheetOverlay, isDesktop && styles.sheetOverlayDesktop]}
          onPress={() => setProfileMentor(null)}
        >
          <Pressable
            style={[
              styles.profileSheet,
              { paddingBottom: insets.bottom + spacing.sm },
              isDesktop && styles.profileSheetDesktop,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />
            {profileMentor ? (
              <>
                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                >
                  <ParticipantProfileDetail
                    profile={profileMentor.profile}
                    mentorProfile={profileMentor.mentor}
                  />

                  {!profileMentor.mentor.bio?.trim() ? (
                    <Text muted style={styles.noBio}>
                      {t('mentorship.student.chooser.noBio')}
                    </Text>
                  ) : null}
                </ScrollView>

                <View style={styles.modalFooter}>
                  {profileMentor.isAcceptingStudents && profileMentor.hasCapacity ? (
                    <Button
                      fullWidth
                      onPress={() => {
                        onSelect(profileMentor.mentorUserId);
                        setProfileMentor(null);
                      }}
                      loading={isSelecting}
                    >
                      {t('mentorship.student.chooser.chooseCoach')}
                    </Button>
                  ) : (
                    <Text style={styles.atCapacityText}>
                      {t('mentorship.student.chooser.atCapacity')}
                    </Text>
                  )}
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  root: { flex: 1 },
  centered: { padding: spacing.lg, alignItems: 'center', gap: spacing.md },

  // ─── Toolbar ──────────────────────────────────────────────────────────────
  toolbar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  toolbarRow: { gap: spacing.sm },
  toolbarRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarLabel: { fontSize: 22, fontWeight: '700', color: colors.text },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchRowDesktop: { width: 380, flexGrow: 0, flexShrink: 0 },
  searchField: { flex: 1 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // ─── Category pills ───────────────────────────────────────────────────────
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipPillEmoji: { fontSize: 13 },
  chipPillText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipPillTextActive: { color: '#fff' },
  chipWrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },

  // ─── Sections ─────────────────────────────────────────────────────────────
  section: { paddingTop: spacing.md },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  horizontalRow: { paddingHorizontal: spacing.md, gap: spacing.sm },
  emptyText: {
    padding: spacing.lg,
    fontSize: 14,
    lineHeight: 22,
  },

  // ─── Waiting list ─────────────────────────────────────────────────────────
  waitingWrap: {
    gap: spacing.md,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  waitingIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingTitle: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
  waitingBody: { lineHeight: 22, textAlign: 'center' },

  // ─── Bottom sheets (filters + profile) ────────────────────────────────────
  sheetOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheetOverlayDesktop: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
  },
  sheetDesktop: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    maxHeight: '85%',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sheetScroll: { paddingHorizontal: spacing.lg },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleLabel: { fontSize: 15, color: colors.text, fontWeight: '500', flex: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterGroupFirst: { gap: spacing.xs, paddingTop: spacing.xs },
  filterGroup: { marginTop: spacing.md, gap: spacing.xs },
  filterGroupLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
  sheetFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sheetFooterBtn: { flex: 1 },

  // ─── Profile sheet ────────────────────────────────────────────────────────
  profileSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  profileSheetDesktop: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    maxHeight: '85%',
  },
  modalScroll: { flexGrow: 0 },
  modalContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  noBio: {
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 14,
  },
  modalFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  atCapacityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
}
