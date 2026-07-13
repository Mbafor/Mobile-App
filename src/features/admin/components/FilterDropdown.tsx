import { useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { Text } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';

type FilterOption<T extends string> = { value: T; label: string };

type FilterDropdownProps<T extends string> = {
  label: string;
  value: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
};

/** Single-select dropdown for ad hoc screen filters (no "Other" free-text support --
 * options are always a fixed, known set here, unlike the opportunity-form selects). */
export function FilterDropdown<T extends string>({ label, value, options, onChange }: FilterDropdownProps<T>) {
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const [open, setOpen] = useState(false);

  const currentLabel = options.find((o) => o.value === value)?.label ?? label;

  return (
    <View style={styles.field}>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text muted style={styles.triggerLabel}>
          {label}
        </Text>
        <View style={styles.triggerValueRow}>
          <Text style={styles.triggerValue} numberOfLines={1}>
            {currentLabel}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, isDesktop && styles.overlayDesktop]} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, isDesktop && styles.sheetDesktop]} onPress={(e) => e.stopPropagation()}>
            <Text variant="title" style={styles.sheetTitle}>
              {label}
            </Text>
            <ScrollView style={styles.list}>
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
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

type MultiFilterDropdownProps = {
  label: string;
  values: Set<string>;
  options: string[];
  onToggle: (value: string) => void;
};

/** Multi-select dropdown for ad hoc screen filters (immediate toggle, no Apply step). */
export function MultiFilterDropdown({ label, values, options, onToggle }: MultiFilterDropdownProps) {
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const [open, setOpen] = useState(false);

  const currentLabel = values.size > 0 ? `${values.size} selected` : label;

  return (
    <View style={styles.field}>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text muted style={styles.triggerLabel}>
          {label}
        </Text>
        <View style={styles.triggerValueRow}>
          <Text style={styles.triggerValue} numberOfLines={1}>
            {currentLabel}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, isDesktop && styles.overlayDesktop]} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, isDesktop && styles.sheetDesktop]} onPress={(e) => e.stopPropagation()}>
            <Text variant="title" style={styles.sheetTitle}>
              {label}
            </Text>
            <ScrollView style={styles.list}>
              {options.map((option) => {
                const active = values.has(option);
                return (
                  <Pressable key={option} style={[styles.option, active && styles.optionActive]} onPress={() => onToggle(option)}>
                    <Text style={styles.checkbox}>{active ? '☑' : '☐'}</Text>
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable style={styles.doneBtn} onPress={() => setOpen(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    field: { flex: 1, minWidth: 150 },
    trigger: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.sm + 2,
      backgroundColor: colors.surface,
      gap: 2,
    },
    triggerLabel: { fontSize: 11 },
    triggerValueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    triggerValue: { flex: 1, fontSize: typography.fontSize.sm, fontWeight: '600', color: colors.text },
    chevron: { color: colors.textMuted, fontSize: 11 },
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    overlayDesktop: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '75%',
      paddingBottom: spacing.lg,
    },
    sheetDesktop: {
      borderRadius: 16,
      width: '100%',
      maxWidth: 440,
      maxHeight: '80%',
    },
    sheetTitle: { padding: spacing.md, paddingBottom: spacing.sm },
    list: { maxHeight: 340 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionActive: { backgroundColor: colors.surface },
    checkbox: { fontSize: 18, color: colors.primary },
    optionText: { fontSize: typography.fontSize.md, color: colors.text, flex: 1 },
    optionTextActive: { fontWeight: '600', color: colors.primary },
    doneBtn: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
    },
    doneBtnText: { color: colors.textOnPrimary, fontWeight: '600' },
  });
}
