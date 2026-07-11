import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  placeholder,
  trailing,
}: SearchFilterBarProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <SearchField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('superAdmin.searchFilterBar.defaultPlaceholder')}
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
