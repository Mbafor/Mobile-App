import { useEffect, useState } from 'react';
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

import { Input, Text } from '@/components/ui';
import type { SelectOption } from '@/constants/onboarding-options';
import { OTHER_OPTION_VALUE } from '@/constants/onboarding-options';
import { spacing, typography } from '@/constants/theme';
import {
  parseSingleSelectValue,
  serializeSingleSelectValue,
} from '@/utils/onboarding/select-values';

type SelectWithOtherProps = {
  options: SelectOption[];
  predefinedValues: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SelectWithOther({
  options,
  predefinedValues,
  value,
  onChange,
  placeholder = 'Select an option',
}: SelectWithOtherProps) {
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [otherText, setOtherText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const parsed = parseSingleSelectValue(value, predefinedValues);
    setSelected(parsed.selected);
    setOtherText(parsed.otherText);
  }, [value, predefinedValues]);

  const displayLabel =
    value && selected !== OTHER_OPTION_VALUE
      ? value
      : value && selected === OTHER_OPTION_VALUE
        ? otherText || OTHER_OPTION_VALUE
        : placeholder;

  const openModal = () => {
    setSearch('');
    setOpen(true);
  };

  const closeModal = () => {
    setSearch('');
    setOpen(false);
  };

  const filteredOptions = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const applySelection = (optionValue: string) => {
    setSelected(optionValue);
    if (optionValue !== OTHER_OPTION_VALUE) {
      setOtherText('');
      onChange(serializeSingleSelectValue(optionValue, '', predefinedValues));
      closeModal();
    }
  };

  const applyOtherText = (text: string) => {
    setOtherText(text);
    onChange(serializeSingleSelectValue(OTHER_OPTION_VALUE, text, predefinedValues));
  };

  return (
    <View>
      <Pressable style={styles.trigger} onPress={openModal}>
        <Text style={[styles.triggerText, !value && styles.placeholder]}>{displayLabel}</Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      {selected === OTHER_OPTION_VALUE || (value && !predefinedValues.includes(value)) ? (
        <Input
          style={styles.otherInput}
          value={otherText}
          onChangeText={applyOtherText}
          placeholder="Please specify"
        />
      ) : null}

      <Modal visible={open} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={closeModal}>
        <Pressable style={[styles.overlay, isDesktop && styles.overlayDesktop]} onPress={closeModal}>
          <Pressable style={[styles.sheet, isDesktop && styles.sheetDesktop]} onPress={(e) => e.stopPropagation()}>
            <Text variant="title" style={styles.sheetTitle}>
              Select
            </Text>

            <View style={styles.searchRow}>
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Search..."
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
              />
            </View>

            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {filteredOptions.length === 0 ? (
                <Text muted style={styles.noResults}>
                  No results for "{search}"
                </Text>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selected === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.option, isSelected && styles.optionSelected]}
                      onPress={() => applySelection(option.value)}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            {selected === OTHER_OPTION_VALUE ? (
              <View style={styles.otherBlock}>
                <Text variant="caption" muted>
                  Please specify
                </Text>
                <Input
                  value={otherText}
                  onChangeText={applyOtherText}
                  placeholder="Enter your course / major"
                />
              </View>
            ) : null}

            <ButtonRow
              onClose={() => {
                if (selected === OTHER_OPTION_VALUE && !otherText.trim()) {
                  return;
                }
                closeModal();
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ButtonRow({ onClose }: { onClose: () => void }) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable style={styles.doneBtn} onPress={onClose}>
      <Text style={styles.doneBtnText}>Done</Text>
    </Pressable>
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
      padding: spacing.md,
      backgroundColor: colors.background,
    },
    triggerText: { fontSize: typography.fontSize.md, color: colors.text, flex: 1 },
    placeholder: { color: colors.textMuted },
    chevron: { color: colors.textMuted, fontSize: 12, marginLeft: spacing.sm },
    otherInput: { marginTop: spacing.sm },
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
      maxWidth: 520,
      maxHeight: '80%',
    },
    sheetTitle: { padding: spacing.md, paddingBottom: spacing.sm },
    searchRow: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    searchInput: {},
    list: { maxHeight: 320 },
    noResults: {
      paddingVertical: spacing.lg,
      textAlign: 'center',
    },
    option: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionSelected: { backgroundColor: colors.surface },
    optionText: { fontSize: typography.fontSize.md, color: colors.text },
    optionTextSelected: { color: colors.primary, fontWeight: '600' },
    doneBtn: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
    },
    doneBtnText: { color: colors.textOnPrimary, fontWeight: '600' },
    otherBlock: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      gap: spacing.xs,
    },
  });
}
