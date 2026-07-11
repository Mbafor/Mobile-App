import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type PaginationBarProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function PaginationBar({ page, pageSize, total, onPageChange }: PaginationBarProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);

  return (
    <View style={styles.row}>
      <Text muted variant="caption">
        {t('superAdmin.pagination.range', { start, end, total })}
      </Text>
      <View style={styles.buttons}>
        <Button variant="secondary" onPress={() => onPageChange(page - 1)} disabled={page <= 0}>
          {t('superAdmin.pagination.prev')}
        </Button>
        <Text variant="caption">
          {t('superAdmin.pagination.pageOfTotal', { page: page + 1, totalPages })}
        </Text>
        <Button
          variant="secondary"
          onPress={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          {t('superAdmin.pagination.next')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
