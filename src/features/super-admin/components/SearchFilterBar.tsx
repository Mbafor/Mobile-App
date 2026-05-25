import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { SearchField } from '@/components/ui';
import { spacing } from '@/constants/theme';

type SearchFilterBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  trailing?: ReactNode;
};

export function SearchFilterBar({
  value,
  onChangeText,
  placeholder = 'Search…',
  trailing,
}: SearchFilterBarProps) {
  return (
    <View style={styles.wrap}>
      <SearchField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        variant="docs"
        style={styles.search}
        trailing={trailing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  search: { flex: 1 },
});
