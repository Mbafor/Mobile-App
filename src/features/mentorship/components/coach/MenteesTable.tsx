import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { UserAvatarDisplay } from '@/components/ui/UserAvatarDisplay';
import { Text } from '@/components/ui';
import { OptionsSheet } from '@/components/ui/OptionsSheet';
import { ParticipantProfileDetail } from '@/features/mentorship/components/shared/ParticipantProfileDetail';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import type { MenteeSummary } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';
import { confirmAction } from '@/utils/confirm-action';

type MenteesTableProps = {
  mentees: MenteeSummary[];
  onRemove: (mentorshipId: string) => void;
  isRemoving?: boolean;
  onMessage?: (mentorshipId: string) => void;
};

export function MenteesTable({ mentees, onRemove, isRemoving, onMessage }: MenteesTableProps) {
  const [profileMentee, setProfileMentee] = useState<MenteeSummary | null>(null);
  const [menuMentee, setMenuMentee] = useState<MenteeSummary | null>(null);

  return (
    <>
      <View style={styles.tableShell}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              <HeaderCell label="Profile" width={88} />
              <HeaderCell label="Name" width={190} />
              <HeaderCell label="Course" width={180} />
              <HeaderCell label="University" width={210} />
              <HeaderCell label="Ends On" width={120} />
              <HeaderCell label="Actions" width={170} />
            </View>

            {mentees.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text muted>
                  No active mentees. Students from the waiting list will appear here when assigned.
                </Text>
              </View>
            ) : (
              mentees.map((row) => {
                const name = row.profile.fullName?.trim() || 'Student';
                return (
                  <View key={row.mentorship.id} style={styles.row}>
                    <View style={[styles.cell, styles.avatarCell, { width: 88 }]}>
                      <UserAvatarDisplay
                        displayName={name}
                        avatarUrl={row.profile.avatarUrl ?? null}
                        size={36}
                      />
                    </View>
                    <CellText width={190} text={name} />
                    <CellText width={180} text={row.profile.courseMajor?.trim() || '-'} />
                    <CellText width={210} text={row.profile.university?.trim() || '-'} />
                    <CellText
                      width={120}
                      text={new Date(row.mentorship.endsAt).toLocaleDateString()}
                    />
                    <View style={[styles.cell, styles.actionsCell, { width: 170 }]}>
                      <Pressable
                        style={styles.menuBtn}
                        hitSlop={12}
                        onPress={() => setMenuMentee(row)}
                        accessibilityLabel={`Actions for ${name}`}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={22}
                          color={mentorshipColors.text}
                        />
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      <OptionsSheet
        visible={menuMentee != null}
        title={menuMentee?.profile.fullName?.trim() ?? 'Student'}
        onClose={() => setMenuMentee(null)}
        options={[
          {
            key: 'view',
            label: 'View profile',
            onPress: () => {
              if (menuMentee) setProfileMentee(menuMentee);
            },
          },
          {
            key: 'message',
            label: 'Message',
            onPress: () => {
              if (menuMentee) onMessage?.(menuMentee.mentorship.id);
            },
          },
          {
            key: 'delete',
            label: isRemoving ? 'Deleting…' : 'Delete',
            destructive: true,
            onPress: () => {
              if (!menuMentee) return;
              void (async () => {
                const ok = await confirmAction(
                  'Remove student',
                  `Are you sure you want to remove ${menuMentee.profile.fullName?.trim() || 'this student'} from mentorship?`,
                );
                if (!ok) return;
                onRemove(menuMentee.mentorship.id);
              })();
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
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.profileScroll}>
            {profileMentee ? (
              <ParticipantProfileDetail profile={profileMentee.profile} roleLabel="Mentee" />
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

function HeaderCell({ label, width }: { label: string; width: number }) {
  return (
    <View style={[styles.headerCell, { width }]}>
      <Text style={styles.headerText}>{label}</Text>
    </View>
  );
}

function CellText({ width, text }: { width: number; text: string }) {
  return (
    <View style={[styles.cell, { width }]}>
      <Text numberOfLines={2} style={styles.cellText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tableShell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: mentorshipColors.surfaceElevated,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: mentorshipColors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.border,
  },
  headerCell: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  headerText: {
    fontSize: 12,
    color: mentorshipColors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.border,
    minHeight: 72,
  },
  cell: { justifyContent: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  cellText: { color: mentorshipColors.text, fontSize: 14, fontWeight: '500' },
  avatarCell: { alignItems: 'center' },
  actionsCell: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  emptyRow: { padding: spacing.lg, alignItems: 'center' },
  profileModal: { flex: 1, backgroundColor: mentorshipColors.surfaceElevated },
  menuBtn: {
    padding: spacing.xs,
    borderRadius: 10,
    backgroundColor: mentorshipColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  closeText: { color: mentorshipColors.textMuted, fontWeight: '600' },
  profileScroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
});
