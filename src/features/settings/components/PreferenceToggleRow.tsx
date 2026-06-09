import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PreferenceToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
  loading,
}: Props) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text>{label}</Text>
        {description ? (
          <Text muted variant="caption">
            {description}
          </Text>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      )}
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
  copy: { flex: 1, gap: spacing.xs },
});
}
