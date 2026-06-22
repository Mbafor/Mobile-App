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
  parseMultiSelectValues,
  serializeMultiSelectValues,
} from '@/utils/onboarding/select-values';

type MultiSelectWithOtherProps = {
  options: SelectOption[];
  predefinedValues: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  /** When true, each selection is saved immediately (no Apply step required). */
  syncOnChange?: boolean;
};

export function MultiSelectWithOther({
  options,
  predefinedValues,
  values,
  onChange,
  placeholder = 'Select options',
  syncOnChange = false,
}: MultiSelectWithOtherProps) {
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const [open, setOpen] = useState(false);
  const [draftSelected, setDraftSelected] = useState<string[]>([]);
  const [draftOtherText, setDraftOtherText] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const parsed = parseMultiSelectValues(values, predefinedValues);
    setDraftSelected(parsed.selected);
    setDraftOtherText(parsed.otherText);
  }, [values, predefinedValues]);

  const displayValues = values;

  const commitDraft = (selected: string[], otherText: string) => {
    onChange(serializeMultiSelectValues(selected, otherText, predefinedValues));
  };

  const toggleOption = (optionValue: string) => {
    setDraftSelected((prev) => {
      const next = prev.includes(optionValue)
        ? prev.filter((v) => v !== optionValue)
        : [...prev, optionValue];
      if (syncOnChange) {
        commitDraft(next, draftOtherText);
      }
      return next;
    });
  };

  const removeChip = (item: string) => {
    onChange(values.filter((v) => v !== item));
  };

  const apply = () => {
    onChange(serializeMultiSelectValues(draftSelected, draftOtherText, predefinedValues));
    setOpen(false);
    setSearch('');
  };

  const openModal = () => {
    const parsed = parseMultiSelectValues(values, predefinedValues);
    setDraftSelected(parsed.selected);
    setDraftOtherText(parsed.otherText);
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

  const showOtherInput = draftSelected.includes(OTHER_OPTION_VALUE);

  return (
    <View>
      <Pressable style={styles.trigger} onPress={openModal}>
        <Text
          style={[
            styles.triggerText,
            displayValues.length === 0 && styles.placeholder,
          ]}
        >
          {displayValues.length > 0
            ? `${displayValues.length} selected`
            : placeholder}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      {displayValues.length > 0 ? (
        <View style={styles.chips}>
          {displayValues.map((item) => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
              <Pressable onPress={() => removeChip(item)} hitSlop={8}>
                <Text style={styles.chipRemove}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <Modal visible={open} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={closeModal}>
        <Pressable style={[styles.overlay, isDesktop && styles.overlayDesktop]} onPress={closeModal}>
          <Pressable style={[styles.sheet, isDesktop && styles.sheetDesktop]} onPress={(e) => e.stopPropagation()}>
            <Text variant="title" style={styles.sheetTitle}>
              Select options
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
                  const isSelected = draftSelected.includes(option.value);
                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.option, isSelected && styles.optionSelected]}
                      onPress={() => toggleOption(option.value)}
                    >
                      <Text style={styles.checkbox}>{isSelected ? '☑' : '☐'}</Text>
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            {showOtherInput ? (
              <View style={styles.otherBlock}>
                <Text variant="caption" muted>
                  Specify other (comma-separated for multiple)
                </Text>
                <Input
                  value={draftOtherText}
                  onChangeText={(text) => {
                    setDraftOtherText(text);
                    if (syncOnChange) {
                      commitDraft(draftSelected, text);
                    }
                  }}
                  placeholder="e.g. Biotechnology"
                  multiline
                />
              </View>
            ) : null}

            {syncOnChange ? (
              <Pressable style={styles.doneBtn} onPress={closeModal}>
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.doneBtn} onPress={apply}>
                <Text style={styles.doneBtnText}>Apply</Text>
              </Pressable>
            )}
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
      padding: spacing.md,
      backgroundColor: colors.background,
    },
    triggerText: { fontSize: typography.fontSize.md, color: colors.text, flex: 1 },
    placeholder: { color: colors.textMuted },
    chevron: { color: colors.textMuted, fontSize: 12, marginLeft: spacing.sm },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 4,
      paddingLeft: spacing.sm,
      paddingRight: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipText: { fontSize: 13, color: colors.text },
    chipRemove: { fontSize: 18, color: colors.textMuted, paddingHorizontal: 4 },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
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
      maxHeight: '82%',
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
    list: { maxHeight: 300 },
    noResults: {
      paddingVertical: spacing.lg,
      textAlign: 'center',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionSelected: { backgroundColor: colors.surface },
    checkbox: { fontSize: 18, color: colors.primary },
    optionText: { fontSize: typography.fontSize.md, color: colors.text, flex: 1 },
    optionTextSelected: { fontWeight: '600', color: colors.primary },
    otherBlock: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      gap: spacing.xs,
    },
    doneBtn: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
    },
    doneBtnText: { color: colors.background, fontWeight: '600' },
  });
}
