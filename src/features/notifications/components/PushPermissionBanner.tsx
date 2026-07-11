import { StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

export function PushPermissionBanner() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>{t('notifications.permissionBanner.title')}</Text>
      <Text muted variant="caption">
        {t('notifications.permissionBanner.subtitle')}
      </Text>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  title: { fontWeight: '600' },
  banner: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
});
}
