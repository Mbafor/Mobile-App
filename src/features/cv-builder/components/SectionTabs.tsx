import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { CV_SECTIONS, type CVSectionId } from '@/features/cv-builder/constants/sections';
import { colors, spacing } from '@/constants/theme';

type SectionTabsProps = {
  active: CVSectionId;
  onSelect: (section: CVSectionId) => void;
  disabled?: boolean;
};

export function SectionTabs({ active, onSelect, disabled }: SectionTabsProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {CV_SECTIONS.map((section) => {
          const isActive = section.id === active;
          return (
            <Pressable
              key={section.id}
              onPress={() => onSelect(section.id)}
              disabled={disabled}
              style={[styles.tab, isActive && styles.tabActive, disabled && styles.tabDisabled]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {section.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabDisabled: { opacity: 0.55 },
  tabText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  tabTextActive: { color: colors.background },
});
