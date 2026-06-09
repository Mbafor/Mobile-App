import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { ColorScheme, ThemeMode } from '@/constants/theme/types';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

const OPTIONS: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'system', label: 'System', description: 'Match your device settings' },
  { value: 'light', label: 'Light', description: 'Always use light mode' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode' },
];

export function AppearanceSection() {
  const { mode, setMode } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View>
      {OPTIONS.map((option, index) => {
        const selected = mode === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => setMode(option.value)}
            style={[styles.row, index === OPTIONS.length - 1 && styles.rowLast]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            <View style={styles.copy}>
              <Text>{option.label}</Text>
              <Text muted variant="caption">
                {option.description}
              </Text>
            </View>
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.radioDot} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      gap: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    copy: { flex: 1, gap: spacing.xs },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: { borderColor: colors.primary },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
  });
}
