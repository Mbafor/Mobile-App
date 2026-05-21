import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/constants/theme';

export const cvUi = StyleSheet.create({
  sectionGap: { gap: spacing.md },
  surfaceCard: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  entryCard: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  entryTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  removeText: { fontSize: 13, fontWeight: '600', color: colors.error },
  multiline: { minHeight: 96, textAlignVertical: 'top' as const },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
});
