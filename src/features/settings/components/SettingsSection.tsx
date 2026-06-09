import type { PropsWithChildren } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type SettingsSectionProps = PropsWithChildren<{
  index: number;
  title: string;
}>;

export function SettingsSection({ index, title, children }: SettingsSectionProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index}</Text>
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.underline} />
        </View>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
  titleWrap: {
    flex: 1,
    paddingTop: 2,
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  underline: {
    height: 3,
    width: 48,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
}
