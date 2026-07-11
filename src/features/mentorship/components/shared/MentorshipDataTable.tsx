import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

export type MentorshipTableColumn<T> = {
  key: string;
  label: string;
  flex?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render: (row: T) => ReactNode;
};

type MentorshipDataTableProps<T> = {
  columns: MentorshipTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
};

export function MentorshipDataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage,
}: MentorshipDataTableProps<T>) {
  const styles = useAppThemedStyles(createStyles);
  const { t } = useTranslation();
  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text muted>{emptyMessage ?? t('mentorship.list.noData')}</Text>
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
                col.flex != null && { flex: col.flex },
                col.minWidth != null && { minWidth: col.minWidth },
                col.align === 'right' && styles.alignRight,
                col.align === 'center' && styles.alignCenter,
              ]}
            >
              <Text style={styles.headerText}>{col.label}</Text>
            </View>
          ))}
        </View>
        {data.map((row, index) => (
          <View
            key={keyExtractor(row)}
            style={[styles.bodyRow, index % 2 === 1 && styles.bodyRowAlt]}
          >
            {columns.map((col) => (
              <View
                key={col.key}
                style={[
                  styles.cell,
                  col.flex != null && { flex: col.flex },
                  col.minWidth != null && { minWidth: col.minWidth },
                  col.align === 'right' && styles.alignRight,
                  col.align === 'center' && styles.alignCenter,
                ]}
              >
                {col.render(row)}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  table: {
    minWidth: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: mentorshipColors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: mentorshipColors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.border,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: mentorshipColors.textMuted,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.borderSubtle,
  },
  bodyRowAlt: { backgroundColor: mentorshipColors.surface },
  cell: { flex: 1, paddingHorizontal: spacing.xs, justifyContent: 'center' },
  alignRight: { alignItems: 'flex-end' },
  alignCenter: { alignItems: 'center' },
  empty: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: mentorshipColors.surface,
    borderRadius: 12,
  },
});
}
