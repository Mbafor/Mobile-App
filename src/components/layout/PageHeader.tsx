import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { webPressableStyle } from '@/utils/web/pressable';

const SLOT_WIDTH = 72;

type PageHeaderProps = {
  title: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
};

export function PageHeader({ title, onBack, rightSlot }: PageHeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.row}>
      <View style={styles.leftSlot}>
        <Pressable
          onPress={handleBack}
          style={Platform.OS === 'web'
            ? webPressableStyle(styles.backBtn, styles.backBtnHover)
            : styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
      </View>

      <Text
        style={[styles.title, getWebFontStyle('semibold')]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View style={styles.rightSlot}>
        {rightSlot ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  leftSlot: {
    width: SLOT_WIDTH,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSlot: {
    width: SLOT_WIDTH,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnHover: Platform.OS === 'web' ? { backgroundColor: colors.border } : {},
});
