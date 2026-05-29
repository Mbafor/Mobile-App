import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OptionsSheet } from '@/components/ui/OptionsSheet';
import { formatAvailabilityRule } from '@/features/mentorship/utils/format-availability';
import type { MentorAvailabilityRule } from '@/types/domain/mentorship';
import { colors, spacing } from '@/constants/theme';

const DAYS: { key: string; label: string }[] = [
  { key: '0', label: 'Sunday' },
  { key: '1', label: 'Monday' },
  { key: '2', label: 'Tuesday' },
  { key: '3', label: 'Wednesday' },
  { key: '4', label: 'Thursday' },
  { key: '5', label: 'Friday' },
  { key: '6', label: 'Saturday' },
];

type AvailabilityEditorProps = {
  rules: MentorAvailabilityRule[];
  onSave: (rule: Omit<MentorAvailabilityRule, 'id' | 'mentorId'> & { id?: string }) => void;
  onDelete: (ruleId: string) => void;
  isSaving?: boolean;
};

export function AvailabilityEditor({ rules, onSave, onDelete, isSaving }: AvailabilityEditorProps) {
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  );
  const [daySheetOpen, setDaySheetOpen] = useState(false);

  const addRule = () => {
    if (startTime >= endTime) {
      Alert.alert('Invalid times', 'End time must be after start time.');
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
        <Text muted>No availability published yet.</Text>
      ) : (
        rules.map((rule) => (
          <View key={rule.id} style={styles.ruleRow}>
            <Text style={styles.ruleText}>
              {formatAvailabilityRule(rule.dayOfWeek, rule.startTime, rule.endTime, rule.timezone)}
            </Text>
            <Pressable onPress={() => onDelete(rule.id)}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
        ))
      )}

      <Text variant="caption" muted style={styles.addLabel}>
        Add weekly slot
      </Text>
      <Pressable style={styles.dayPicker} onPress={() => setDaySheetOpen(true)}>
        <Text>{DAYS.find((d) => d.key === dayOfWeek)?.label ?? 'Day'}</Text>
      </Pressable>
      <View style={styles.row}>
        <Input value={startTime} onChangeText={setStartTime} placeholder="09:00" style={styles.time} />
        <Text muted>to</Text>
        <Input value={endTime} onChangeText={setEndTime} placeholder="17:00" style={styles.time} />
      </View>
      <Input value={timezone} onChangeText={setTimezone} placeholder="Timezone (e.g. UTC)" />
      <Button onPress={addRule} loading={isSaving}>
        Add availability
      </Button>

      <OptionsSheet
        visible={daySheetOpen}
        title="Day of week"
        options={DAYS.map((d) => ({
          key: d.key,
          label: d.label,
          onPress: () => setDayOfWeek(d.key),
        }))}
        onClose={() => setDaySheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
