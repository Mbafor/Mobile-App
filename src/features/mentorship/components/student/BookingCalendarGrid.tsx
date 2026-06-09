import { useMemo, useState } from 'react';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import { MentorshipMobileList } from '@/features/mentorship/components/shared/MentorshipMobileList';
import {
  buildBookingSlots,
  slotToBookingPayload,
  type BookingSlot,
} from '@/features/mentorship/utils/build-booking-slots';
import type { MentorAvailabilityRule, MentorshipSession } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type BookingCalendarGridProps = {
  mentorshipId: string;
  userId: string;
  rules: MentorAvailabilityRule[];
  sessions: MentorshipSession[];
  onBook: (input: {
    mentorshipId: string;
    createdBy: string;
    scheduledStart: string;
    scheduledEnd: string;
    timezone: string;
    title?: string;
    notes?: string;
  }) => Promise<void>;
  isBooking?: boolean;
};

export function BookingCalendarGrid({
  mentorshipId,
  userId,
  rules,
  sessions,
  onBook,
  isBooking,
}: BookingCalendarGridProps) {
  const styles = useAppThemedStyles(createStyles);
  const slots = useMemo(() => buildBookingSlots(rules, sessions), [rules, sessions]);
  const [pendingSlot, setPendingSlot] = useState<BookingSlot | null>(null);
  const [notes, setNotes] = useState('');

  const confirmBook = async () => {
    if (!pendingSlot) return;
    const trimmed = notes.trim();
    if (trimmed.length < 8) {
      Alert.alert('Add a note', 'Please write at least a short reason for this session (8+ characters).');
      return;
    }
    try {
      await onBook({
        ...slotToBookingPayload(pendingSlot, mentorshipId, userId),
        notes: trimmed,
      });
      setPendingSlot(null);
      setNotes('');
      Alert.alert('Session requested', 'Your coach will see your note and confirm the booking.');
    } catch (e) {
      Alert.alert('Booking failed', e instanceof Error ? e.message : 'Try again.');
    }
  };

  if (rules.length === 0) {
    return (
      <Text muted style={styles.empty}>
        Your coach has not set availability yet. Message them to arrange a time.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text muted style={styles.hint}>
        Tap an available slot. Add a short note so your coach knows what you want to discuss.
      </Text>

      <MentorshipMobileList
        data={slots}
        keyExtractor={(row) => row.id}
        emptyMessage="No upcoming slots in the next 4 weeks."
        renderCard={(row) => (
          <View style={styles.slotCard}>
            <View style={styles.slotTop}>
              <View>
                <Text style={styles.day}>{row.dayLabel}</Text>
                <Text style={styles.date}>{row.dateLabel}</Text>
              </View>
              <View
                style={[
                  styles.badge,
                  row.status === 'booked' ? styles.badgeBooked : styles.badgeOpen,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    row.status === 'available' && styles.badgeTextOpen,
                  ]}
                >
                  {row.status === 'booked' ? 'Booked' : 'Available'}
                </Text>
              </View>
            </View>
            <Text style={styles.time}>{row.timeLabel}</Text>
            <Text variant="caption" muted>
              {row.timezone} · local time
            </Text>
            {row.status === 'available' ? (
              <Pressable
                style={[styles.bookBtn, isBooking && styles.bookBtnDisabled]}
                onPress={() => {
                  setPendingSlot(row);
                  setNotes('');
                }}
                disabled={isBooking}
              >
                <Text style={styles.bookBtnText}>Book session</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      />

      <Modal
        visible={pendingSlot != null}
        transparent
        animationType="slide"
        onRequestClose={() => setPendingSlot(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPendingSlot(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Book session</Text>
            {pendingSlot ? (
              <Text muted style={styles.modalSub}>
                {pendingSlot.dayLabel} {pendingSlot.dateLabel} · {pendingSlot.timeLabel}
              </Text>
            ) : null}
            <Text style={styles.notesLabel}>Why are you booking? (required)</Text>
            <TextArea
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Review my CV and discuss internship applications…"
              minHeight={100}
              maxLength={500}
            />
            <View style={styles.modalActions}>
              <Button variant="ghost" onPress={() => setPendingSlot(null)}>
                Cancel
              </Button>
              <Button onPress={() => void confirmBook()} loading={isBooking}>
                Request session
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: { gap: spacing.sm },
  hint: { fontSize: 13, marginBottom: spacing.xs },
  empty: { padding: spacing.lg, textAlign: 'center' },
  slotCard: { padding: spacing.md, gap: spacing.sm },
  slotTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  day: { fontSize: 16, fontWeight: '700', color: mentorshipColors.text },
  date: { fontSize: 13, color: mentorshipColors.textMuted },
  time: { fontSize: 15, fontWeight: '600', color: mentorshipColors.text },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  badgeOpen: { backgroundColor: mentorshipColors.accentMuted },
  badgeBooked: { backgroundColor: mentorshipColors.surface },
  badgeText: { fontSize: 12, fontWeight: '600', color: mentorshipColors.textMuted },
  badgeTextOpen: { color: mentorshipColors.accent },
  bookBtn: {
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: mentorshipColors.accent,
    alignItems: 'center',
  },
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnText: { color: mentorshipColors.textOnAccent, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: mentorshipColors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
    maxHeight: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: mentorshipColors.text },
  modalSub: { marginBottom: spacing.xs },
  notesLabel: { fontWeight: '600', fontSize: 14, color: mentorshipColors.text },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
}
