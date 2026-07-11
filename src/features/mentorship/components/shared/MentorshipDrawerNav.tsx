import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

export type MentorshipNavItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type MentorshipDrawerNavProps = {
  items: MentorshipNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function MentorshipDrawerNav({ items, activeId, onSelect }: MentorshipDrawerNavProps) {
  const styles = useAppThemedStyles(createStyles);
  const { mentorshipColors } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        style={styles.menuBtn}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t('mentorship.drawer.open')}
      >
        <Ionicons name="menu" size={20} color={mentorshipColors.text} />
        <Text style={styles.menuLabel}>{t('mentorship.drawer.sections')}</Text>
        <Ionicons name="chevron-down" size={14} color={mentorshipColors.textMuted} />
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>{t('mentorship.drawer.title')}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={mentorshipColors.textMuted} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {items.map((item) => {
                const active = item.id === activeId;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.item, active && styles.itemActive]}
                    onPress={() => {
                      onSelect(item.id);
                      setOpen(false);
                    }}
                  >
                    <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={active ? mentorshipColors.textOnAccent : mentorshipColors.textMuted}
                      />
                    </View>
                    <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>
                      {item.label}
                    </Text>
                    {active ? (
                      <View style={styles.activeDot} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: 10,
    backgroundColor: mentorshipColors.surface,
  },
  menuLabel: { fontWeight: '600', fontSize: 14, color: mentorshipColors.text },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    flexDirection: 'row',
  },
  panel: {
    width: 300,
    maxWidth: '88%',
    backgroundColor: mentorshipColors.surfaceElevated,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  panelTitle: { fontSize: 20, fontWeight: '700', color: mentorshipColors.text },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.xs,
  },
  itemActive: { backgroundColor: mentorshipColors.accentMuted },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mentorshipColors.surface,
  },
  iconWrapActive: { backgroundColor: mentorshipColors.accent },
  itemLabel: { flex: 1, fontSize: 15, color: mentorshipColors.text },
  itemLabelActive: { color: mentorshipColors.accent, fontWeight: '600' },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: mentorshipColors.accent,
  },
});
}
