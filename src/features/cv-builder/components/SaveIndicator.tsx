import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import type { SaveIndicatorState } from '@/features/cv-builder/hooks/useCVBuilder';
import { spacing } from '@/constants/theme';

type SaveIndicatorProps = {
  state: SaveIndicatorState;
  errorMessage?: string | null;
};

export function SaveIndicator({ state, errorMessage }: SaveIndicatorProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  if (state === 'idle') {
    return (
      <View style={styles.row}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
        <Text muted variant="caption">
          {t('cvBuilder.saveIndicator.idle')}
        </Text>
      </View>
    );
  }

  if (state === 'saving') {
    return (
      <View style={styles.row}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text muted variant="caption">
          {t('cvBuilder.saveIndicator.saving')}
        </Text>
      </View>
    );
  }

  if (state === 'saved') {
    return (
      <View style={styles.row}>
        <Ionicons name="checkmark-circle" size={14} color={colors.success} />
        <Text style={styles.saved} variant="caption">
          {t('cvBuilder.saveIndicator.saved')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Ionicons name="alert-circle" size={14} color={colors.error} />
      <Text style={styles.error} variant="caption">
        {errorMessage ?? t('cvBuilder.saveIndicator.errorFallback')}
      </Text>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  saved: { color: colors.success, fontWeight: '600' },
  error: { color: colors.error, fontWeight: '600', flex: 1 },
});
}
