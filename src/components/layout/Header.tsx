import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type HeaderProps = PropsWithChildren<{
  title: string;
}>;

export function Header({ title, children }: HeaderProps) {
  return (
    <View style={styles.row}>
      <Text variant="title">{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
});
