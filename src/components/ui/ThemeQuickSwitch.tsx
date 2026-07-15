import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { OptionsSheet } from '@/components/ui/OptionsSheet';
import { spacing } from '@/constants/theme';
import type { ColorScheme, ThemeMode } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';

export function ThemeQuickSwitch({ compact = false }: { compact?: boolean }) {
  const styles = useThemedStyles(createStyles);
  const { colors, isDark, mode, setMode } = useTheme();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const options: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: t('settings.appearance.system') },
    { value: 'light', label: t('settings.appearance.light') },
    { value: 'dark', label: t('settings.appearance.dark') },
  ];

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel={t('settings.appearance.sectionLabel')}
      >
        <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={14} color={colors.textMuted} />
        {!compact && (
          <Text style={styles.triggerText}>
            {options.find((option) => option.value === mode)?.label}
          </Text>
        )}
        {!compact && <Ionicons name="chevron-down" size={12} color={colors.textMuted} />}
      </Pressable>

      <OptionsSheet
        visible={visible}
        title={t('settings.appearance.sectionLabel')}
        onClose={() => setVisible(false)}
        options={options.map((option) => ({
          key: option.value,
          label: option.label,
          onPress: () => setMode(option.value),
        }))}
      />
    </>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs / 2,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    triggerText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
  });
}
