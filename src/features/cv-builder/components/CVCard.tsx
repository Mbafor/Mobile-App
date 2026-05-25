import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { getTemplateDefinition } from '@/features/cv-builder/constants/templates';
import { colors, spacing } from '@/constants/theme';
import type { CV } from '@/types/domain/cv';

type CVCardProps = {
  cv: CV;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isDuplicating?: boolean;
  isDeleting?: boolean;
};

function formatUpdatedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function CVCard({
  cv,
  onEdit,
  onDuplicate,
  onDelete,
  isDuplicating,
  isDeleting,
}: CVCardProps) {
  const busy = isDuplicating || isDeleting;
  const templateLabel = getTemplateDefinition(cv.templateId)?.label ?? cv.templateId;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onEdit}
        disabled={busy}
        style={({ pressed }) => [styles.mainRow, pressed && styles.cardPressed]}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="document-text-outline" size={28} color={colors.primary} />
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {cv.title}
          </Text>
          <Text muted variant="caption">
            Updated {formatUpdatedAt(cv.updatedAt)}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{templateLabel}</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Pressable onPress={onEdit} disabled={busy} style={styles.actionChip}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={styles.actionPrimary}>Edit</Text>
        </Pressable>
        <Pressable onPress={onDuplicate} disabled={busy} style={styles.actionChip}>
          {isDuplicating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="copy-outline" size={16} color={colors.text} />
              <Text style={styles.actionText}>Copy</Text>
            </>
          )}
        </Pressable>
        <Pressable onPress={onDelete} disabled={busy} style={styles.actionChip}>
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text style={styles.actionDanger}>Delete</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardPressed: { backgroundColor: colors.surface },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 160, gap: spacing.xs },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    width: '100%',
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  actionPrimary: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  actionText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  actionDanger: { color: colors.error, fontWeight: '600', fontSize: 13 },
});
