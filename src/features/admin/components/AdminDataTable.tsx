import type { ReactNode } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  flex?: number;
  minWidth?: number;
  render: (row: T) => ReactNode;
};

type AdminDataTableProps<T> = {
  columns: AdminTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  footer?: ReactNode;
};

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage,
  footer,
}: AdminDataTableProps<T>) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  if (data.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text muted>{emptyMessage ?? t('admin.table.noRecords')}</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          {columns.map((col) => (
            <View
              key={col.key}
              style={[
                styles.cell,
                col.flex ? { flex: col.flex } : undefined,
                col.minWidth ? { minWidth: col.minWidth } : { minWidth: 100 },
              ]}
            >
              <Text style={styles.headerText}>{col.header}</Text>
            </View>
          ))}
        </View>
        {data.map((row) => (
          <View key={keyExtractor(row)} style={styles.dataRow}>
            {columns.map((col) => (
              <View
                key={col.key}
                style={[
                  styles.cell,
                  col.flex ? { flex: col.flex } : undefined,
                  col.minWidth ? { minWidth: col.minWidth } : { minWidth: 100 },
                ]}
              >
                {col.render(row)}
              </View>
            ))}
          </View>
        ))}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    minWidth: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  cell: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, justifyContent: 'center' },
  headerText: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  footer: { padding: spacing.sm },
  emptyWrap: { padding: spacing.lg, alignItems: 'center' },
});
}
