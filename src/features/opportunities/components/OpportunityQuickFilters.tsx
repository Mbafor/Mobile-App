import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import {
  FILTER_CATEGORIES,
  FILTER_DEGREE_LEVELS,
  FILTER_FUNDING_TYPES,
  FILTER_LOCATION_TYPES,
  FUNDING_TYPE_LABELS,
} from '@/constants/search-filters';
import { spacing, typography } from '@/constants/theme';
import type { LocationType, OpportunityFilters } from '@/types/domain/opportunity';

type QuickFilterField = 'categories' | 'fundingTypes' | 'degreeLevels' | 'locationTypes';

type QuickFilterOption = { value: string; label: string };

type QuickFilterDef = {
  field: QuickFilterField;
  label: string;
  sheetLabel: string;
  options: QuickFilterOption[];
};

type OpportunityQuickFiltersProps = {
  filters: OpportunityFilters;
  onChange: (filters: OpportunityFilters) => void;
};

function withField(
  filters: OpportunityFilters,
  field: QuickFilterField,
  values: string[],
): OpportunityFilters {
  switch (field) {
    case 'categories':
      return { ...filters, categories: values };
    case 'fundingTypes':
      return { ...filters, fundingTypes: values };
    case 'degreeLevels':
      return { ...filters, degreeLevels: values };
    case 'locationTypes':
      return { ...filters, locationTypes: values as LocationType[] };
  }
}

export function OpportunityQuickFilters({ filters, onChange }: OpportunityQuickFiltersProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isDesktop = useWebDesktop();
  const [openField, setOpenField] = useState<QuickFilterField | null>(null);

  const defs: QuickFilterDef[] = [
    {
      field: 'categories',
      label: t('opportunities.filtersPanel.category'),
      sheetLabel: t('opportunities.filtersPanel.category'),
      options: FILTER_CATEGORIES.map((value) => ({ value, label: value })),
    },
    {
      field: 'fundingTypes',
      label: t('opportunities.quickFilters.fundingShort'),
      sheetLabel: t('opportunities.filtersPanel.fundingType'),
      options: FILTER_FUNDING_TYPES.map((value) => ({
        value,
        label: FUNDING_TYPE_LABELS[value] ?? value,
      })),
    },
    {
      field: 'degreeLevels',
      label: t('opportunities.quickFilters.degreeShort'),
      sheetLabel: t('opportunities.filtersPanel.degreeLevel'),
      options: FILTER_DEGREE_LEVELS.map((value) => ({
        value,
        label: value.replace('_', ' '),
      })),
    },
    {
      field: 'locationTypes',
      label: t('opportunities.quickFilters.locationShort'),
      sheetLabel: t('opportunities.filtersPanel.locationType'),
      options: FILTER_LOCATION_TYPES.map((o) => ({ value: o.value, label: o.label })),
    },
  ];

  const activeDef = defs.find((d) => d.field === openField) ?? null;

  const toggleOption = (field: QuickFilterField, value: string) => {
    const current = filters[field] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange(withField(filters, field, next));
  };

  const clearField = (field: QuickFilterField) => {
    onChange(withField(filters, field, []));
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {defs.map((def) => {
          const count = (filters[def.field] as string[]).length;
          const active = count > 0;
          return (
            <Pressable
              key={def.field}
              onPress={() => setOpenField(def.field)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ expanded: openField === def.field }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {def.label}
                {active ? ` (${count})` : ''}
              </Text>
              <Ionicons
                name="chevron-down"
                size={10}
                color={active ? colors.textOnPrimary : colors.textMuted}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal
        visible={activeDef !== null}
        transparent
        animationType={isDesktop ? 'fade' : 'slide'}
        onRequestClose={() => setOpenField(null)}
      >
        <Pressable
          style={[styles.overlay, isDesktop && styles.overlayDesktop]}
          onPress={() => setOpenField(null)}
        >
          <Pressable
            style={[styles.sheet, isDesktop && styles.sheetDesktop]}
            onPress={(e) => e.stopPropagation()}
          >
            {activeDef ? (
              <>
                <View style={styles.sheetHeader}>
                  <Text variant="title">{activeDef.sheetLabel}</Text>
                  <Pressable onPress={() => clearField(activeDef.field)} hitSlop={8}>
                    <Text style={styles.clearText}>{t('opportunities.filtersPanel.clearAll')}</Text>
                  </Pressable>
                </View>
                <ScrollView contentContainerStyle={styles.optionGrid}>
                  {activeDef.options.map((opt) => {
                    const isSelected = (filters[activeDef.field] as string[]).includes(opt.value);
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => toggleOption(activeDef.field, opt.value)}
                        style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
                      >
                        <Text
                          style={[styles.optionBtnText, isSelected && styles.optionBtnTextActive]}
                          numberOfLines={1}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <Pressable style={styles.doneBtn} onPress={() => setOpenField(null)}>
                  <Text style={styles.doneBtnText}>{t('opportunities.filtersPanel.showResults')}</Text>
                </Pressable>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
    },
    chip: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: { fontSize: 12, fontWeight: '600', color: colors.text },
    chipTextActive: { color: colors.textOnPrimary },
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
      maxWidth: 420,
      maxHeight: '70%',
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
    },
    clearText: { fontSize: 14, fontWeight: '600', color: colors.primary },
    optionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    optionBtn: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    optionBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionBtnText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      textTransform: 'capitalize',
    },
    optionBtnTextActive: { color: colors.textOnPrimary, fontWeight: '600' },
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
