import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing } from '@/constants/theme';
import { useThemedStyles } from '@/hooks/useThemedStyles';

type FormFieldProps = PropsWithChildren<{
  label: string;
  error?: string;
}>;

export function FormField({ label, error, children }: FormFieldProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.field}>
      <Text variant="caption">{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    field: { gap: spacing.xs, marginBottom: spacing.md },
    error: { color: colors.error, fontSize: 12 },
  });
}
