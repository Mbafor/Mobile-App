import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

const EMOJIS = [
  '😀', '😂', '😍', '🥳', '🙏', '👍', '👏', '🙌',
  '🔥', '🎉', '❤️', '✨', '🤔', '😎', '💪', '👋',
  '😢', '😮', '🤝', '💡', '📚', '🎓', '⭐', '😅',
];

type EmojiPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
};

export function EmojiPickerSheet({ visible, onClose, onSelect }: EmojiPickerSheetProps) {
  const styles = useAppThemedStyles(createStyles);
  const { mentorshipColors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('mentorship.chat.emojiSheet.title')}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('mentorship.chat.emojiSheet.close')}
            >
              <Ionicons name="close" size={22} color={mentorshipColors.textMuted} />
            </Pressable>
          </View>
          <View style={styles.grid}>
            {EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                style={styles.cell}
                onPress={() => onSelect(emoji)}
                accessibilityRole="button"
                accessibilityLabel={emoji}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors } = theme;
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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    title: { fontSize: 18, fontWeight: '700', color: mentorshipColors.text },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    cell: {
      width: '12.5%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emoji: { fontSize: 26 },
  });
}
