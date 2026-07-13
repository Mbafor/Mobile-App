import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { getStageAccentColor } from '@/features/opportunities/constants/tracker-ui';
import { spacing, typography } from '@/constants/theme';
import { TRACKER_STAGE_ORDER, type TrackerStage } from '@/types/domain/tracker';

type TrackerStatusSheetProps = {
  visible: boolean;
  currentStage: TrackerStage | null;
  onSelect: (stage: TrackerStage) => void;
  onClose: () => void;
};

export function TrackerStatusSheet({
  visible,
  currentStage,
  onSelect,
  onClose,
}: TrackerStatusSheetProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isDesktop = useWebDesktop();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDesktop ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.overlay, isDesktop && styles.overlayDesktop]}
        onPress={onClose}
      >
        <Pressable
          style={[styles.sheet, isDesktop && styles.sheetDesktop]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{t('opportunities.tracker.statusSheetTitle')}</Text>

          {TRACKER_STAGE_ORDER.map((stage) => {
            const isCurrent = stage === currentStage;
            return (
              <Pressable
                key={stage}
                onPress={() => onSelect(stage)}
                style={styles.option}
                accessibilityRole="button"
                accessibilityState={{ selected: isCurrent }}
              >
                <View
                  style={[styles.dot, { backgroundColor: getStageAccentColor(stage, colors) }]}
                />
                <Text style={[styles.optionText, isCurrent && styles.optionTextCurrent]}>
                  {t(`opportunities.tracker.stages.${stage}`)}
                </Text>
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    overlayDesktop: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    sheet: {
      backgroundColor: colors.surfaceElevated,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    sheetDesktop: {
      borderRadius: 20,
      width: '100%',
      maxWidth: 420,
      paddingBottom: spacing.md,
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: spacing.sm,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 4,
      paddingVertical: spacing.sm + 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    dot: { width: 9, height: 9, borderRadius: 5 },
    optionText: { fontSize: typography.fontSize.md, fontWeight: '600', color: colors.text },
    optionTextCurrent: { color: colors.primary },
  });
}
