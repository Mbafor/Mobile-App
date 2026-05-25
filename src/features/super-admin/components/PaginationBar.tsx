import { StyleSheet, View } from 'react-native';

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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);

  return (
    <View style={styles.row}>
      <Text muted variant="caption">
        {start}–{end} of {total}
      </Text>
      <View style={styles.buttons}>
        <Button variant="secondary" onPress={() => onPageChange(page - 1)} disabled={page <= 0}>
          Prev
        </Button>
        <Text variant="caption">
          {page + 1} / {totalPages}
        </Text>
        <Button
          variant="secondary"
          onPress={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          Next
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
