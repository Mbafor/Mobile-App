import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Input, Text } from '@/components/ui';
import { FUNDING_OPTIONS } from '@/constants/onboarding';
import { spacing, typography } from '@/constants/theme';
import type { FundingPreference } from '@/types/domain/user-preferences';

type FundingPickerProps = {
  value: FundingPreference;
  onChange: (value: FundingPreference) => void;
  /** Hide "Any funding" (for admin opportunity listings). */
  excludeAny?: boolean;
};

export function FundingPicker({ value, onChange, excludeAny }: FundingPickerProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const options = excludeAny
    ? FUNDING_OPTIONS.filter((o) => o.value !== 'any')
    : FUNDING_OPTIONS;

  const filteredOptions = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selectedLabel = options.find((o) => o.value === value)?.label ?? 'Select funding type';
  const hasValue = Boolean(value);

  const openModal = () => {
    setSearch('');
    setOpen(true);
  };

  const closeModal = () => {
    setSearch('');
    setOpen(false);
  };

  return (
    <View>
      <Pressable style={styles.trigger} onPress={openModal} accessibilityRole="button">
        <Text style={[styles.triggerText, !hasValue && styles.placeholder]}>
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.overlay} onPress={closeModal}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Funding preference</Text>
              <Pressable onPress={closeModal} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.searchRow}>
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {filteredOptions.length === 0 ? (
                <Text muted style={styles.noResults}>
                  No results for "{search}"
                </Text>
              ) : (
                filteredOptions.map((option) => {
                  const selected = value === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.option, selected && styles.optionSelected]}
                      onPress={() => {
                        onChange(option.value);
                        closeModal();
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
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
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
      maxHeight: '65%',
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
    searchRow: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    noResults: {
      paddingVertical: spacing.lg,
      textAlign: 'center',
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
}
