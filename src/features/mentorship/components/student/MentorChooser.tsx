import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useMemo, useState } from 'react';
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
  partitionRecommendedMentors,
  platformHasNoCoaches,
  shouldOfferWaitingList,
} from '@/features/mentorship/utils/filter-available-mentors';
import type { AvailableMentor } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';

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
}: MentorChooserProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, refetch, isFetching } = useAvailableMentors({ enabled: true });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MentorBrowseFilterId>('all');
  const [profileMentor, setProfileMentor] = useState<AvailableMentor | null>(null);

  const mentors = data ?? [];
  const filtered = useMemo(
    () => filterAvailableMentors(mentors, search, category),
    [mentors, search, category],
  );
  const { recommended, all } = useMemo(
    () => partitionRecommendedMentors(filtered),
    [filtered],
  );

  const showWaitingList = !isLoading && !error && shouldOfferWaitingList(mentors);
  const showEmptySearch =
    !isLoading && !error && !showWaitingList && mentors.length > 0 && filtered.length === 0;
  const listMentors = recommended.length > 0 ? all : filtered;

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
        <Text muted>Could not load coaches.</Text>
        <Button onPress={() => void refetch()}>Retry</Button>
      </View>
    );
  }

  if (showWaitingList) {
    return (
      <View style={styles.waitingWrap}>
        <Text style={[styles.waitingTitle, getWebFontStyle('bold')]}>
          No coaches available right now
        </Text>
        <Text muted style={styles.waitingBody}>
          {platformHasNoCoaches(mentors)
            ? 'There are no coaches on the platform yet. Join the waiting list and we will notify you when a coach is available.'
            : 'Every coach is currently full. Join the waiting list to be notified when a slot opens.'}
        </Text>
        {onJoinWaitingList ? (
          <Button fullWidth onPress={onJoinWaitingList} loading={isSelecting}>
            Join waiting list
          </Button>
        ) : null}
      </View>
    );
  }

  const renderList = (items: AvailableMentor[]) => (
    <View>
      {items.map((m, i) => (
        <View key={m.mentorUserId}>
          <MentorBrowseCard mentor={m} onViewProfile={() => setProfileMentor(m)} />
          {i < items.length - 1 ? <View style={styles.separator} /> : null}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Search */}
      <View style={styles.toolbar}>
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or expertise…"
        />
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {MENTOR_BROWSE_FILTERS.map((chip) => {
          const active = category === chip.id;
          return (
            <Pressable
              key={chip.id}
              onPress={() => setCategory(chip.id)}
              style={styles.filterTab}
            >
              <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                {chip.label}
              </Text>
              {active ? <View style={styles.filterTabUnderline} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.divider} />

      {/* Recommended */}
      {recommended.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recommended for you</Text>
          {renderList(recommended)}
          <View style={styles.divider} />
        </View>
      ) : null}

      {/* All coaches */}
      <View style={styles.section}>
        {recommended.length > 0 ? (
          <Text style={styles.sectionLabel}>All coaches</Text>
        ) : null}

        {showEmptySearch ? (
          <Text muted style={styles.emptyText}>
            No coaches match your search. Try a different keyword or filter.
          </Text>
        ) : listMentors.length === 0 ? (
          <Text muted style={styles.emptyText}>No coaches to display.</Text>
        ) : (
          renderList(listMentors)
        )}
      </View>

      {/* Profile modal */}
      <Modal
        visible={profileMentor != null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProfileMentor(null)}
      >
        {profileMentor ? (
          <View style={[styles.modal, { paddingTop: Math.max(insets.top, spacing.sm) }]}>
            {/* Modal header — back arrow left, title center */}
            <View style={styles.modalHeader}>
              <Pressable
                onPress={() => setProfileMentor(null)}
                style={styles.modalBackBtn}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </Pressable>
              <Text style={[styles.modalHeaderTitle, getWebFontStyle('semibold')]}>
                Coach Profile
              </Text>
              {/* spacer for symmetry */}
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={[
                styles.modalContent,
                { paddingBottom: spacing.xl + insets.bottom },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* ParticipantProfileDetail already shows avatar + name + email */}
              <ParticipantProfileDetail
                profile={profileMentor.profile}
                mentorProfile={profileMentor.mentor}
              />

              {!profileMentor.mentor.bio?.trim() ? (
                <Text muted style={styles.noBio}>
                  This coach has not added a bio yet.
                </Text>
              ) : null}
            </ScrollView>

            {/* CTA footer — Choose only, no "Back to coaches" */}
            <View style={[styles.modalFooter, { paddingBottom: insets.bottom + spacing.sm }]}>
              {profileMentor.isAcceptingStudents && profileMentor.hasCapacity ? (
                <Button
                  fullWidth
                  onPress={() => {
                    onSelect(profileMentor.mentorUserId);
                    setProfileMentor(null);
                  }}
                  loading={isSelecting}
                >
                  Choose this coach
                </Button>
              ) : (
                <Text style={styles.atCapacityText}>
                  This coach is currently at capacity
                </Text>
              )}
            </View>
          </View>
        ) : null}
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
    paddingBottom: spacing.xs,
  },

  // ─── Filter tabs ──────────────────────────────────────────────────────────
  filterScroll: { flexGrow: 0 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  filterTab: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  filterTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  filterTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },

  // ─── Divider ──────────────────────────────────────────────────────────────
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  // ─── List ─────────────────────────────────────────────────────────────────
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 48 + spacing.md,
  },

  // ─── Sections ─────────────────────────────────────────────────────────────
  section: { paddingTop: spacing.xs },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
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
  },
  waitingTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  waitingBody: { lineHeight: 22 },

  // ─── Profile modal ────────────────────────────────────────────────────────
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  modalHeaderSpacer: { width: 36 },
  modalScroll: { flex: 1 },
  modalContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    width: '100%',
  },
  noBio: {
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 14,
  },
  modalFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    width: '100%',
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
