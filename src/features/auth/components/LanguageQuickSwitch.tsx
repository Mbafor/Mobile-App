import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { OptionsSheet } from '@/components/ui/OptionsSheet';
import { spacing } from '@/constants/theme';
import type { ColorScheme } from '@/constants/theme/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import type { LanguageMode } from '@/i18n/types';

export function LanguageQuickSwitch() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [visible, setVisible] = useState(false);

  // Language endonyms ("English", "Français") are intentionally not translated.
  const options: { value: LanguageMode; label: string }[] = [
    { value: 'system', label: t('settings.language.system') },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ];

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel={t('settings.language.sectionLabel')}
      >
        <Ionicons name="globe-outline" size={14} color={colors.textMuted} />
        <Text style={styles.triggerText}>{language.toUpperCase()}</Text>
        <Ionicons name="chevron-down" size={12} color={colors.textMuted} />
      </Pressable>

      <OptionsSheet
        visible={visible}
        title={t('settings.language.sectionLabel')}
        onClose={() => setVisible(false)}
        options={options.map((option) => ({
          key: option.value,
          label: option.label,
          onPress: () => setLanguage(option.value),
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
      alignSelf: 'flex-end',
      gap: spacing.xs / 2,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
      marginBottom: spacing.sm,
    },
    triggerText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
  });
}
