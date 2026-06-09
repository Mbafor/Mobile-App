import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { getTemplateDefinition } from '@/features/cv-builder/constants/templates';
import { spacing } from '@/constants/theme';
import type { CV } from '@/types/domain/cv';

type CVDocumentListItemProps = {
  cv: CV;
  onPress: () => void;
  onMenuPress: () => void;
  isRenaming?: boolean;
  isDeleting?: boolean;
};

function formatUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function CVDocumentListItem({
  cv,
  onPress,
  onMenuPress,
  isRenaming,
  isDeleting,
}: CVDocumentListItemProps) {
  const styles = useAppThemedStyles(createStyles);
  const { colors, cvDocsTheme } = useTheme();
  const busy = isRenaming || isDeleting;
  const templateLabel = getTemplateDefinition(cv.templateId)?.label ?? 'CV';

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPress}
        disabled={busy}
        style={({ pressed }) => [styles.main, pressed && styles.rowPressed]}
      >
        <View style={styles.docIcon}>
          <Ionicons name="document-text" size={22} color={colors.background} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {cv.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {templateLabel} · Updated {formatUpdatedAt(cv.updatedAt)}
          </Text>
        </View>
      </Pressable>
      {busy ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.menuBtn} />
      ) : (
        <Pressable
          onPress={(e) => {
            e?.stopPropagation?.();
            onMenuPress();
          }}
          hitSlop={12}
          style={styles.menuBtn}
          accessibilityLabel="CV options"
          accessibilityRole="button"
        >
          <Ionicons name="ellipsis-vertical" size={20} color={cvDocsTheme.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cvDocsTheme.barBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cvDocsTheme.divider,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  rowPressed: { backgroundColor: cvDocsTheme.hover },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 14, fontWeight: '500', color: colors.text },
  meta: { fontSize: 12, color: cvDocsTheme.textSecondary },
  menuBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
});
}
