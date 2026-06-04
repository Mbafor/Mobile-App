import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { FUNDING_OPTIONS } from '@/constants/onboarding';
import { colors, spacing, typography } from '@/constants/theme';
import type { FundingPreference } from '@/types/domain/user-preferences';

type FundingPickerProps = {
  value: FundingPreference;
  onChange: (value: FundingPreference) => void;
  /** Hide "Any funding" (for admin opportunity listings). */
  excludeAny?: boolean;
};

export function FundingPicker({ value, onChange, excludeAny }: FundingPickerProps) {
  const [open, setOpen] = useState(false);

  const options = excludeAny
    ? FUNDING_OPTIONS.filter((o) => o.value !== 'any')
    : FUNDING_OPTIONS;

  const selectedLabel = options.find((o) => o.value === value)?.label ?? 'Select funding type';
  const hasValue = Boolean(value);

  return (
    <View>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)} accessibilityRole="button">
        <Text style={[styles.triggerText, !hasValue && styles.placeholder]}>
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Funding preference</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const selected = value === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark" size={18} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  triggerText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  placeholder: { color: colors.textMuted },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: spacing.xl,
    maxHeight: '60%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  optionSelected: { backgroundColor: `${colors.primary}08` },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  optionTextSelected: { color: colors.primary, fontWeight: '600' },
});
