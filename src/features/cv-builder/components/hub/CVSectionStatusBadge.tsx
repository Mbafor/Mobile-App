import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { CVSectionStatusKind } from '@/features/cv-builder/utils/section-config';

type CVSectionStatusBadgeProps = {
  kind: CVSectionStatusKind;
  label: string;
};

const BADGE_STYLES: Record<
  CVSectionStatusKind,
  { bg: string; text: string; border: string }
> = {
  complete: { bg: '#E8F0FE', text: '#1F73B7', border: '#C6DFFE' },
  in_progress: { bg: '#F0F4F8', text: '#5F6368', border: '#DADCE0' },
  action_required: { bg: '#FFF8E6', text: '#8A6B00', border: '#F0E0A8' },
  optional: { bg: '#F3EEF8', text: '#5A4578', border: '#DDD0EB' },
};

export function CVSectionStatusBadge({ kind, label }: CVSectionStatusBadgeProps) {
  const palette = BADGE_STYLES[kind];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: { fontSize: 11, fontWeight: '700' },
});
