import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Input, Text } from '@/components/ui';
import { getFundingOptions } from '@/constants/onboarding';
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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const options = excludeAny
    ? getFundingOptions().filter((o) => o.value !== 'any')
    : getFundingOptions();

  const filteredOptions = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selectedLabel = options.find((o) => o.value === value)?.label ?? t('onboarding.funding.trigger');
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
        animationType={isDesktop ? 'fade' : 'slide'}
        onRequestClose={closeModal}
      >
        <Pressable style={[styles.overlay, isDesktop && styles.overlayDesktop]} onPress={closeModal}>
          <Pressable style={[styles.sheet, isDesktop && styles.sheetDesktop]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('onboarding.funding.sheetTitle')}</Text>
              <Pressable onPress={closeModal} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.searchRow}>
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder={t('onboarding.funding.searchPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {filteredOptions.length === 0 ? (
                <Text muted style={styles.noResults}>
                  {t('onboarding.funding.noResults', { query: search })}
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
      maxHeight: '65%',
    },
    sheetDesktop: {
      borderRadius: 16,
      width: '100%',
      maxWidth: 520,
      maxHeight: '75%',
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
