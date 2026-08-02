import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Text } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';

type WantsMentorPickerProps = {
  value: boolean | null;
  onChange: (value: boolean) => void;
};

/** Yes/No dropdown for the onboarding "do you wish to have a mentor?" question --
 * same trigger + modal-sheet interaction as FundingPicker (its sibling field on
 * the same screen), just two fixed options instead of a searchable list. */
export function WantsMentorPicker({ value, onChange }: WantsMentorPickerProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const options: { value: boolean; label: string }[] = [
    { value: true, label: t('onboarding.wantsMentor.yes') },
    { value: false, label: t('onboarding.wantsMentor.no') },
  ];

  const selectedLabel =
    value === null ? t('onboarding.wantsMentor.trigger') : options.find((o) => o.value === value)!.label;

  return (
    <View>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)} accessibilityRole="button">
        <Text style={[styles.triggerText, value === null && styles.placeholder]}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, isDesktop && styles.overlayDesktop]} onPress={() => setOpen(false)}>
          <Pressable style={[styles.sheet, isDesktop && styles.sheetDesktop]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('onboarding.wantsMentor.sheetTitle')}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            {options.map((option) => {
              const selected = value === option.value;
              return (
                <Pressable
                  key={String(option.value)}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                  {selected ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
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
      paddingBottom: spacing.xl,
    },
    sheetDesktop: {
      borderRadius: 16,
      width: '100%',
      maxWidth: 420,
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
}
