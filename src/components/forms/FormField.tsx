import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type FormFieldProps = PropsWithChildren<{
  label: string;
  error?: string;
}>;

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text variant="caption">{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs, marginBottom: spacing.md },
  error: { color: '#B00020', fontSize: 12 },
});
