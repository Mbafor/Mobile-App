import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { spacing, typography } from '@/constants/theme';

export type FilterDropdownOption<T extends string> = {
  value: T;
  label: string;
  /** Omit to render a plain option with no count. */
  count?: number;
};

type FilterDropdownProps<T extends string> = {
  options: FilterDropdownOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

/** A single-select dropdown filter — trigger shows the current option's label, tap to pick another from a list. */
export function FilterDropdown<T extends string>({ options, selected, onSelect, style }: FilterDropdownProps<T>) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === selected) ?? options[0];

  return (
    <View style={style}>
      <Pressable
        style={styles.trigger}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {selectedOption?.label}
          {selectedOption?.count !== undefined ? ` (${selectedOption.count})` : ''}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, isDesktop && styles.overlayDesktop]} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, isDesktop && styles.sheetDesktop]} onPress={(e) => e.stopPropagation()}>
            <ScrollView style={styles.list}>
              {options.map((opt) => {
                const active = opt.value === selected;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => {
                      onSelect(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {opt.label}
                      {opt.count !== undefined ? ` (${opt.count})` : ''}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
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

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm + 4,
      backgroundColor: colors.surface,
      minWidth: 140,
    },
    triggerText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },
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
      maxHeight: '70%',
      paddingVertical: spacing.sm,
    },
    sheetDesktop: {
      borderRadius: 16,
      width: '100%',
      maxWidth: 360,
      maxHeight: '70%',
    },
    list: { maxHeight: 360 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionActive: { backgroundColor: colors.surface },
    optionText: { fontSize: typography.fontSize.md, color: colors.text },
    optionTextActive: { color: colors.primary, fontWeight: '600' },
  });
}
