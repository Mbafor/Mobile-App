import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
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
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { useAvailableMentors } from '@/features/mentorship/hooks/useAvailableMentors';
import {
  filterAvailableMentors,
  partitionRecommendedMentors,
  platformHasNoCoaches,
  shouldOfferWaitingList,
} from '@/features/mentorship/utils/filter-available-mentors';
import type { AvailableMentor } from '@/types/domain/mentorship';
import { colors, spacing } from '@/constants/theme';

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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data, isLoading, error, refetch, isFetching } = useAvailableMentors({
    enabled: true,
  });
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
  const isWeb = Platform.OS === 'web';
  const webColumns = width >= 1024 ? 3 : width >= 760 ? 2 : 1;
  const webCardWidth = isWeb ? `${100 / webColumns}%` : '100%';

  if (isLoading || (isFetching && mentors.length === 0)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={mentorshipColors.accent} />
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
        <Text style={styles.waitingTitle}>No coaches available right now</Text>
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

  const renderMentor = (item: AvailableMentor) => {
    const card = (
      <MentorBrowseCard
        key={item.mentorUserId}
        mentor={item}
        onViewProfile={() => setProfileMentor(item)}
        onChoose={() => onSelect(item.mentorUserId)}
        isChoosing={isSelecting && selectingMentorId === item.mentorUserId}
      />
    );
    if (!isWeb) return card;
    return (
      <View key={item.mentorUserId} style={[styles.webCardWrap, { width: webCardWidth }]}>
        {card}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name or expertise…"
        variant="docs"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {MENTOR_BROWSE_FILTERS.map((chip) => {
            const active = category === chip.id;
            return (
              <Pressable
                key={chip.id}
                onPress={() => setCategory(chip.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {recommended.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Coaches For You</Text>
          <View style={[styles.sectionList, isWeb && styles.sectionListWeb]}>
            {recommended.map(renderMentor)}
          </View>
        </View>
      ) : null}

      <View style={[styles.section, styles.sectionLast]}>
        <Text style={styles.sectionTitle}>All Available Coaches</Text>
        {recommended.length > 0 && all.length === 0 ? (
          <Text muted>All matching coaches are shown above.</Text>
        ) : null}
        {showEmptySearch ? (
          <Text muted>No coaches match your search. Try another filter or keyword.</Text>
        ) : listMentors.length === 0 && mentors.length === 0 ? (
          <Text muted>No coaches to display.</Text>
        ) : (
          <View style={[styles.sectionList, isWeb && styles.sectionListWeb]}>
            {listMentors.map(renderMentor)}
          </View>
        )}
      </View>

      <Modal
        visible={profileMentor != null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProfileMentor(null)}
      >
        <View style={[styles.modal, { paddingTop: Math.max(insets.top, spacing.md) }]}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={[
              styles.modalContent,
              { paddingBottom: spacing.xl + insets.bottom },
            ]}
            showsVerticalScrollIndicator
          >
            {profileMentor ? (
              <>
                <ParticipantProfileDetail
                  profile={profileMentor.profile}
                  mentorProfile={profileMentor.mentor}
                />
                {!profileMentor.mentor.bio?.trim() ? (
                  <Text muted style={styles.modalBioEmpty}>
                    This coach has not added a bio yet.
                  </Text>
                ) : null}
                {profileMentor.isAcceptingStudents && profileMentor.hasCapacity ? (
                  <Button
                    fullWidth
                    onPress={() => {
                      onSelect(profileMentor.mentorUserId);
                      setProfileMentor(null);
                    }}
                    loading={isSelecting}
                  >
                    Choose Coach
                  </Button>
                ) : (
                  <Text style={styles.capacityModal}>Currently at capacity</Text>
                )}
              </>
            ) : null}
          </ScrollView>
          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + spacing.sm }]}>
            <Button variant="secondary" fullWidth onPress={() => setProfileMentor(null)}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md, paddingBottom: spacing.xl * 2 },
  centered: { padding: spacing.lg, alignItems: 'center', gap: spacing.md },
  chipScroll: { flexGrow: 0, marginHorizontal: -spacing.xs },
  chipRow: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.xs },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.background },
  section: { gap: spacing.sm },
  sectionLast: { marginBottom: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: mentorshipColors.text },
  sectionList: { gap: spacing.md },
  sectionListWeb: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  webCardWrap: { paddingHorizontal: spacing.xs, paddingBottom: spacing.sm },
  waitingWrap: { gap: spacing.md, padding: spacing.md },
  waitingTitle: { fontSize: 18, fontWeight: '700', color: mentorshipColors.text },
  waitingBody: { lineHeight: 22 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalScroll: { flex: 1 },
  modalContent: { gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  modalFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  modalBioEmpty: { fontStyle: 'italic', textAlign: 'center', marginTop: spacing.xs },
  capacityModal: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#C62828',
    padding: spacing.md,
  },
});
