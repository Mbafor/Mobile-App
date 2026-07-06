import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { webPressableStyle } from '@/utils/web/pressable';

type ProfileSectionRowProps = {
  label: string;
  value: string;
  placeholder?: boolean;
  onPress: () => void;
  showDivider?: boolean;
};

export function ProfileSectionRow({
  label,
  value,
  placeholder,
  onPress,
  showDivider = true,
}: ProfileSectionRowProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={Platform.OS === 'web'
        ? webPressableStyle([styles.row, showDivider && styles.divider], styles.hover)
        : [styles.row, showDivider && styles.divider]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text
          style={[styles.value, placeholder && styles.placeholder]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      minHeight: 64,
    },
    hover: Platform.OS === 'web' ? { backgroundColor: colors.surface } : {},
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    body: { flex: 1, gap: 2, minWidth: 0 },
    label: { fontSize: 13, fontWeight: '700', color: colors.primary, letterSpacing: 0.3 },
    value: { fontSize: 15, color: colors.text, fontWeight: '500' },
    placeholder: { color: colors.textMuted, fontWeight: '400' },
  });
}
