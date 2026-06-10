import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Text } from '@/components/ui';
import { CV_SECTIONS, type CVSectionId } from '@/features/cv-builder/constants/sections';
import { spacing } from '@/constants/theme';

type SectionTabsProps = {
  active: CVSectionId;
  onSelect: (section: CVSectionId) => void;
  disabled?: boolean;
};

export function SectionTabs({ active, onSelect, disabled }: SectionTabsProps) {
  const styles = useThemedStyles(createStyles);
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

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
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
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: 'transparent',
  },
  tabDisabled: { opacity: 0.55 },
  tabText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  tabTextActive: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
}
