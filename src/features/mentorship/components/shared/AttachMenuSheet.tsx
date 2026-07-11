import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import {
  MENTORSHIP_ATTACHMENT_LIMITS,
  formatMaxAttachmentSize,
} from '@/features/mentorship/constants/attachments';
import { spacing } from '@/constants/theme';

export type AttachMenuAction = 'library' | 'camera' | 'document';

type AttachMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: AttachMenuAction) => void;
};

const OPTIONS: { key: AttachMenuAction; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'library', icon: 'images-outline' },
  { key: 'camera', icon: 'camera-outline' },
  { key: 'document', icon: 'document-attach-outline' },
];

export function AttachMenuSheet({ visible, onClose, onSelect }: AttachMenuSheetProps) {
  const styles = useAppThemedStyles(createStyles);
  const { mentorshipColors } = useTheme();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{t('mentorship.chat.attachSheet.title')}</Text>
          <Text variant="caption" muted style={styles.hint}>
            {t('mentorship.chat.attachSheet.sizeHint', {
              image: formatMaxAttachmentSize(MENTORSHIP_ATTACHMENT_LIMITS.imageMaxBytes),
              file: formatMaxAttachmentSize(MENTORSHIP_ATTACHMENT_LIMITS.fileMaxBytes),
            })}
          </Text>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={styles.option}
              onPress={() => {
                onClose();
                onSelect(opt.key);
              }}
            >
              <Ionicons name={opt.icon} size={22} color={mentorshipColors.accent} />
              <Text style={styles.optionLabel}>{t(`mentorship.chat.attachSheet.${opt.key}`)}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>{t('mentorship.chat.attachSheet.cancel')}</Text>
          </Pressable>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: mentorshipColors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  title: { fontSize: 18, fontWeight: '700', color: mentorshipColors.text, marginBottom: spacing.xs },
  hint: { marginBottom: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.borderSubtle,
  },
  optionLabel: { fontSize: 16, color: mentorshipColors.text, flex: 1 },
  cancelBtn: { marginTop: spacing.sm, alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { fontSize: 16, fontWeight: '600', color: mentorshipColors.textMuted },
});
}
