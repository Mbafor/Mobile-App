import { Modal, Pressable, StyleSheet, View } from 'react-native';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/constants/theme';

type CVRenameModalProps = {
  visible: boolean;
  currentTitle: string;
  value: string;
  onChangeValue: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
};

export function CVRenameModal({
  visible,
  currentTitle,
  value,
  onChangeValue,
  onClose,
  onSave,
  saving,
}: CVRenameModalProps) {
  const styles = useAppThemedStyles(createStyles);
  const isDesktopWeb = useWebDesktop();
  const { t } = useTranslation();
  const trimmed = value.trim();
  const canSave = trimmed.length > 0 && trimmed !== currentTitle.trim();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.heading}>{t('cvBuilder.renameModal.heading')}</Text>
          <Input
            value={value}
            onChangeText={onChangeValue}
            placeholder={t('cvBuilder.renameModal.placeholder')}
            autoFocus
            maxLength={120}
          />
          <View style={[styles.actions, isDesktopWeb && styles.actionsDesktop]}>
            <Button
              variant="secondary"
              onPress={onClose}
              disabled={saving}
              style={isDesktopWeb ? undefined : styles.btn}
            >
              {t('cvBuilder.renameModal.cancel')}
            </Button>
            <Button
              onPress={onSave}
              loading={saving}
              disabled={!canSave || saving}
              style={isDesktopWeb ? undefined : styles.btn}
            >
              {t('cvBuilder.renameModal.save')}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: cvDocsTheme.barBg,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heading: { fontSize: 18, fontWeight: '600', color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionsDesktop: { justifyContent: 'flex-end' },
  btn: { flex: 1 },
});
}
