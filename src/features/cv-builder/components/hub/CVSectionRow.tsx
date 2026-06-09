import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { CVSectionStatusBadge } from '@/features/cv-builder/components/hub/CVSectionStatusBadge';
import {
  CV_SECTION_ICON_BG,
  CV_SECTION_ICON_COLOR,
  CV_SECTION_ICONS,
} from '@/features/cv-builder/constants/section-icons';
import { getSectionMeta } from '@/features/cv-builder/constants/section-meta';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import type { CVSectionStatus } from '@/features/cv-builder/utils/section-config';
import { spacing } from '@/constants/theme';

type CVSectionRowProps = {
  sectionId: CVSectionId;
  status: CVSectionStatus;
  onPress: () => void;
  showDivider?: boolean;
};

export function CVSectionRow({ sectionId, status, onPress, showDivider }: CVSectionRowProps) {
  const styles = useAppThemedStyles(createStyles);
  const meta = getSectionMeta(sectionId);
  const iconName = CV_SECTION_ICONS[sectionId];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, showDivider && styles.divider]}
    >
      <View style={[styles.iconWrap, { backgroundColor: CV_SECTION_ICON_BG[sectionId] }]}>
        <Ionicons name={iconName} size={20} color={CV_SECTION_ICON_COLOR[sectionId]} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{meta.title}</Text>
        <Text style={styles.desc} numberOfLines={1}>
          {meta.description}
        </Text>
      </View>
      <CVSectionStatusBadge kind={status.kind} label={status.label} />
      <Ionicons name="chevron-forward" size={18} color={cvDocsTheme.textSecondary} />
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  pressed: { backgroundColor: cvDocsTheme.hover },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cvDocsTheme.divider,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '500', color: colors.text },
  desc: { fontSize: 12, color: cvDocsTheme.textSecondary },
});
}
