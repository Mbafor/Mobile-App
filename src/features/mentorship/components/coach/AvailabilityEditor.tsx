import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OptionsSheet } from '@/components/ui/OptionsSheet';
import { formatAvailabilityRule } from '@/features/mentorship/utils/format-availability';
import type { MentorAvailabilityRule } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

const DAY_KEYS = ['0', '1', '2', '3', '4', '5', '6'];

type AvailabilityEditorProps = {
  rules: MentorAvailabilityRule[];
  onSave: (rule: Omit<MentorAvailabilityRule, 'id' | 'mentorId'> & { id?: string }) => void;
  onDelete: (ruleId: string) => void;
  isSaving?: boolean;
};

export function AvailabilityEditor({ rules, onSave, onDelete, isSaving }: AvailabilityEditorProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
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
  };

  return (
    <View style={styles.wrap}>
      {rules.length === 0 ? (
        <Text muted>{t('mentorship.coach.availability.emptyPublished')}</Text>
      ) : (
        rules.map((rule) => (
          <View key={rule.id} style={styles.ruleRow}>
            <Text style={styles.ruleText}>
              {formatAvailabilityRule(rule.dayOfWeek, rule.startTime, rule.endTime, rule.timezone)}
            </Text>
            <Pressable onPress={() => onDelete(rule.id)}>
              <Text style={styles.delete}>{t('mentorship.coach.availability.delete')}</Text>
            </Pressable>
          </View>
        ))
      )}

      <Text variant="caption" muted style={styles.addLabel}>
        {t('mentorship.coach.availability.addSlot')}
      </Text>
      <Pressable style={styles.dayPicker} onPress={() => setDaySheetOpen(true)}>
        <Text>{t(`mentorship.days.${dayOfWeek}`, { defaultValue: t('mentorship.coach.availability.dayFallback') })}</Text>
      </Pressable>
      <View style={styles.row}>
        <Input value={startTime} onChangeText={setStartTime} placeholder="09:00" style={styles.time} />
        <Text muted>{t('mentorship.coach.availability.to')}</Text>
        <Input value={endTime} onChangeText={setEndTime} placeholder="17:00" style={styles.time} />
      </View>
      <Input value={timezone} onChangeText={setTimezone} placeholder={t('mentorship.coach.availability.timezoneHint')} />
      <Button onPress={addRule} loading={isSaving}>
        {t('mentorship.coach.availability.addAvailability')}
      </Button>

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

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: { gap: spacing.sm },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ruleText: { flex: 1, fontSize: 14 },
  delete: { color: colors.error, fontWeight: '600' },
  addLabel: { marginTop: spacing.sm },
  dayPicker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  time: { flex: 1 },
});
}
