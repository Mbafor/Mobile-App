import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

const AUTO_HIDE_MS = 5000;

type TrackerUndoToastProps = {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onHide: () => void;
};

export function TrackerUndoToast({ visible, message, onUndo, onHide }: TrackerUndoToastProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <View style={styles.toast} pointerEvents="box-none">
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      <Pressable onPress={onUndo} hitSlop={8}>
        <Text style={styles.undo}>{t('opportunities.tracker.undo')}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    toast: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      bottom: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      paddingVertical: spacing.sm + 3,
      paddingHorizontal: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    },
    message: { flex: 1, fontSize: 12.5, color: colors.text },
    undo: { fontSize: 12.5, fontWeight: '700', color: colors.primary },
  });
}
