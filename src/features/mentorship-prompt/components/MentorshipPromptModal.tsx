import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button, Text } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import type { ColorScheme } from '@/constants/theme/types';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useMentorshipPromptStore } from '@/features/mentorship-prompt/store/mentorship-prompt.store';
import { ROUTES } from '@/constants/routes';

export function MentorshipPromptModal() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const isOpen = useMentorshipPromptStore((s) => s.isOpen);
  const close = useMentorshipPromptStore((s) => s.close);

  if (!isOpen) return null;

  const handleGoToMentorship = () => {
    close();
    router.push(ROUTES.MAIN.MENTORSHIP as Href);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Pressable
            onPress={close}
            style={styles.closeBtn}
            hitSlop={12}
            accessibilityLabel={t('mentorshipPrompt.close')}
          >
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>

          <View style={styles.iconWrap}>
            <Ionicons name="people-outline" size={28} color={colors.primary} />
          </View>

          <Text style={styles.title}>{t('mentorshipPrompt.title')}</Text>
          <Text style={styles.message}>{t('mentorshipPrompt.message')}</Text>

          <Button onPress={handleGoToMentorship} style={styles.primaryBtn}>
            {t('mentorshipPrompt.cta')}
          </Button>
          <Button onPress={close} variant="secondary" style={styles.cancelBtn}>
            {t('mentorshipPrompt.cancel')}
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: spacing.lg,
      paddingTop: spacing.xl,
      alignItems: 'center',
    },
    closeBtn: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      zIndex: 1,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}15`,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    message: {
      fontSize: typography.fontSize.md,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    primaryBtn: {
      width: '100%',
    },
    cancelBtn: {
      width: '100%',
      marginTop: spacing.sm,
    },
  });
}
