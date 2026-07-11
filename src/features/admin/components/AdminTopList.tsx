import { StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import type { TopEngagementRow } from '@/features/admin/types/analytics';

type AdminTopListProps = {
  title: string;
  items: TopEngagementRow[];
};

export function AdminTopList({ title, items }: AdminTopListProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {items.length === 0 ? (
        <Text muted>{t('admin.charts.noData')}</Text>
      ) : (
        items.map((item, index) => (
          <View key={item.opportunityId} style={styles.row}>
            <Text style={styles.rank}>{index + 1}.</Text>
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={2}>
                {item.title}
              </Text>
              <Text muted>{t('admin.topList.usersCount', { count: item.count })}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: { fontWeight: '600', fontSize: 15, color: colors.text },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rank: { width: 20, fontWeight: '700', color: colors.primary },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 14, color: colors.text },
});
}
