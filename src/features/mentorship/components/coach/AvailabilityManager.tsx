import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OptionsSheet } from '@/components/ui/OptionsSheet';
import { MentorshipMobileList } from '@/features/mentorship/components/shared/MentorshipMobileList';
import { formatAvailabilityRule, formatDayOfWeek } from '@/features/mentorship/utils/format-availability';
import type { MentorAvailabilityRule } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

const DAY_KEYS = ['0', '1', '2', '3', '4', '5', '6'];

type AvailabilityManagerProps = {
  rules: MentorAvailabilityRule[];
  onSave: (rule: Omit<MentorAvailabilityRule, 'id' | 'mentorId'> & { id?: string }) => void;
  onDelete: (ruleId: string) => void;
  isSaving?: boolean;
};

export function AvailabilityManager({ rules, onSave, onDelete, isSaving }: AvailabilityManagerProps) {
  const styles = useAppThemedStyles(createStyles);
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  );
  const [daySheetOpen, setDaySheetOpen] = useState(false);

  const addRule = () => {
    if (startTime >= endTime) {
      Alert.alert(t('mentorship.coach.availability.invalidTimesTitle'), t('mentorship.coach.availability.invalidTimesMessage'));
      return;
    }
    onSave({
      dayOfWeek: Number(dayOfWeek),
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      timezone: timezone.trim() || 'UTC',
      isActive: true,
    });
    setModalOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text muted style={styles.hint}>
          {t('mentorship.coach.availability.hint')}
        </Text>
        <Pressable style={styles.addBtn} onPress={() => setModalOpen(true)}>
          <Text style={styles.addBtnText}>{t('mentorship.coach.availability.add')}</Text>
        </Pressable>
      </View>

      <MentorshipMobileList
        data={rules}
        keyExtractor={(r) => r.id}
        emptyMessage={t('mentorship.coach.availability.empty')}
        renderCard={(rule) => (
          <View style={styles.ruleCard}>
            <Text style={styles.ruleDay}>{formatDayOfWeek(rule.dayOfWeek)}</Text>
            <Text style={styles.ruleTime}>
              {rule.startTime.slice(0, 5)} – {rule.endTime.slice(0, 5)}
            </Text>
            <Text variant="caption" muted>
              {rule.timezone}
            </Text>
            <View style={styles.ruleActions}>
              <Pressable onPress={() => onDelete(rule.id)}>
                <Text style={styles.delete}>{t('mentorship.coach.availability.delete')}</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('mentorship.coach.availability.addSlot')}</Text>
            <Text variant="caption" muted>
              {formatAvailabilityRule(Number(dayOfWeek), startTime, endTime, timezone)}
            </Text>
            <Pressable style={styles.dayPicker} onPress={() => setDaySheetOpen(true)}>
              <Text>{t(`mentorship.days.${dayOfWeek}`, { defaultValue: t('mentorship.coach.availability.dayFallback') })}</Text>
            </Pressable>
            <View style={styles.timeRow}>
              <Input value={startTime} onChangeText={setStartTime} placeholder="09:00" style={styles.timeInput} />
              <Text muted>{t('mentorship.coach.availability.to')}</Text>
              <Input value={endTime} onChangeText={setEndTime} placeholder="17:00" style={styles.timeInput} />
            </View>
            <Input value={timezone} onChangeText={setTimezone} placeholder={t('mentorship.coach.availability.timezone')} />
            <View style={styles.modalActions}>
              <Button variant="ghost" onPress={() => setModalOpen(false)}>
                {t('mentorship.coach.availability.cancel')}
              </Button>
              <Button onPress={addRule} loading={isSaving}>
                {t('mentorship.coach.availability.save')}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <OptionsSheet
        visible={daySheetOpen}
        title={t('mentorship.coach.availability.dayOfWeek')}
        options={DAY_KEYS.map((k) => ({
          key: k,
          label: t(`mentorship.days.${k}`),
          onPress: () => setDayOfWeek(k),
        }))}
        onClose={() => setDaySheetOpen(false)}
      />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hint: { flex: 1, fontSize: 13 },
  addBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 8,
    backgroundColor: mentorshipColors.accent,
  },
  addBtnText: { color: mentorshipColors.textOnAccent, fontWeight: '600' },
  ruleCard: { padding: spacing.md, gap: 4 },
  ruleDay: { fontSize: 16, fontWeight: '700', color: mentorshipColors.text },
  ruleTime: { fontSize: 15, fontWeight: '500', color: mentorshipColors.text },
  ruleActions: { marginTop: spacing.sm },
  delete: { color: mentorshipColors.danger, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: mentorshipColors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  dayPicker: { padding: spacing.sm, borderRadius: 10, backgroundColor: mentorshipColors.surface },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeInput: { flex: 1 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
});
}
