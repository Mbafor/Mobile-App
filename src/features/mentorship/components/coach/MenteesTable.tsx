import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { Text } from '@/components/ui';
import { OptionsSheet } from '@/components/ui/OptionsSheet';
import { MentorshipMobileList } from '@/features/mentorship/components/shared/MentorshipMobileList';
import { ParticipantProfileDetail } from '@/features/mentorship/components/shared/ParticipantProfileDetail';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import type { MenteeSummary } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type MenteesTableProps = {
  mentees: MenteeSummary[];
  onRemove: (mentorshipId: string) => void;
  isRemoving?: boolean;
};

export function MenteesTable({ mentees, onRemove, isRemoving }: MenteesTableProps) {
  const [menuMentee, setMenuMentee] = useState<MenteeSummary | null>(null);
  const [profileMentee, setProfileMentee] = useState<MenteeSummary | null>(null);

  return (
    <>
      <MentorshipMobileList
        data={mentees}
        keyExtractor={(m) => m.mentorship.id}
        emptyMessage="No active mentees. Students from the waiting list will appear here when assigned."
        renderCard={(row) => {
          const name = row.profile.fullName?.trim() || 'Student';
          return (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <UserAvatarDisplay
                  displayName={name}
                  avatarUrl={row.profile.avatarUrl ?? null}
                  size={48}
                />
                <View style={styles.meta}>
                  <Text style={styles.name}>{name}</Text>
                  {row.profile.courseMajor ? (
                    <Text variant="caption" muted numberOfLines={1}>
                      {row.profile.courseMajor}
                    </Text>
                  ) : null}
                  {row.profile.university ? (
                    <Text variant="caption" muted numberOfLines={1}>
                      {row.profile.university}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  style={styles.menuBtn}
                  hitSlop={12}
                  onPress={() => setMenuMentee(row)}
                  accessibilityLabel={`Actions for ${name}`}
                >
                  <Ionicons name="ellipsis-vertical" size={22} color={mentorshipColors.text} />
                </Pressable>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${row.progressPercent}%` }]} />
              </View>
              <Text variant="caption" muted>
                {row.progressPercent}% of 3-month mentorship · ends{' '}
                {new Date(row.mentorship.endsAt).toLocaleDateString()}
              </Text>
            </View>
          );
        }}
      />

      <OptionsSheet
        visible={menuMentee != null}
        title={menuMentee?.profile.fullName?.trim() ?? 'Student'}
        onClose={() => setMenuMentee(null)}
        options={[
          {
            key: 'view',
            label: 'View full profile',
            onPress: () => {
              if (menuMentee) setProfileMentee(menuMentee);
            },
          },
          {
            key: 'remove',
            label: 'Remove student',
            destructive: true,
            onPress: () => {
              if (menuMentee) onRemove(menuMentee.mentorship.id);
            },
          },
        ]}
      />

      <Modal
        visible={profileMentee != null}
        animationType="slide"
        onRequestClose={() => setProfileMentee(null)}
      >
        <View style={styles.profileModal}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileTitle}>Student profile</Text>
            <Pressable onPress={() => setProfileMentee(null)} hitSlop={12}>
              <Ionicons name="close" size={26} color={mentorshipColors.textMuted} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.profileScroll}>
            {profileMentee ? (
              <ParticipantProfileDetail
                profile={profileMentee.profile}
                roleLabel="Mentee"
              />
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, gap: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { flex: 1, gap: 2 },
  name: { fontSize: 17, fontWeight: '700', color: mentorshipColors.text },
  menuBtn: {
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: mentorshipColors.surface,
  },
  progressTrack: {
    height: 6,
    backgroundColor: mentorshipColors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: mentorshipColors.accent },
  profileModal: { flex: 1, backgroundColor: mentorshipColors.surfaceElevated },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.border,
  },
  profileTitle: { fontSize: 20, fontWeight: '700', color: mentorshipColors.text },
  profileScroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
});
