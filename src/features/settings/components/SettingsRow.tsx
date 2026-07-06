import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { webPressableStyle } from '@/utils/web/pressable';

type SettingsRowProps = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  loading?: boolean;
  showDivider?: boolean;
};

export function SettingsRow({
  label,
  onPress,
  destructive,
  showChevron = true,
  loading,
  showDivider = true,
}: SettingsRowProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={Platform.OS === 'web'
        ? webPressableStyle([styles.row, showDivider && styles.divider], styles.hover)
        : [styles.row, showDivider && styles.divider]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.body}>
        <Text style={[styles.label, destructive && styles.destructiveLabel]}>{label}</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={destructive ? colors.error : colors.primary} />
      ) : showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={destructive ? colors.error : colors.textMuted}
        />
      ) : null}
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
      minHeight: 56,
    },
    hover: Platform.OS === 'web' ? { backgroundColor: colors.surface } : {},
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    body: { flex: 1, minWidth: 0 },
    label: { fontSize: 16, color: colors.text, fontWeight: '500' },
    destructiveLabel: { color: colors.error },
  });
}
