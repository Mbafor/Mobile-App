import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { cvDocsTheme } from '@/features/cv-builder/constants/cv-docs-theme';
import { getTemplateDefinition } from '@/features/cv-builder/constants/templates';
import { colors, spacing } from '@/constants/theme';
import type { CV } from '@/types/domain/cv';

type CVDocumentListItemProps = {
  cv: CV;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isDuplicating?: boolean;
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
  onOpen,
  onDuplicate,
  onDelete,
  isDuplicating,
  isDeleting,
}: CVDocumentListItemProps) {
  const busy = isDuplicating || isDeleting;
  const templateLabel = getTemplateDefinition(cv.templateId)?.label ?? 'CV';

  const showMenu = () => {
    Alert.alert(cv.title, undefined, [
      { text: 'Open', onPress: onOpen },
      { text: 'Make a copy', onPress: onDuplicate },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onOpen}
        disabled={busy}
        style={({ pressed }) => [styles.main, pressed && styles.rowPressed]}
      >
        <View style={styles.docIcon}>
          <Ionicons name="document-text" size={22} color={colors.primary} />
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
        <Pressable onPress={showMenu} hitSlop={12} style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={cvDocsTheme.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: cvDocsTheme.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 14, fontWeight: '500', color: colors.text },
  meta: { fontSize: 12, color: cvDocsTheme.textSecondary },
  menuBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
});
